import * as grpc from "grpc";
import { Subscriber } from "pg-listen";
import { getRepository } from "typeorm";
import * as messages from "../../generated/bulletin_board_pb";
import { Bulletin } from "../entity/Bulletin";
import { User } from "../entity/User";

export class BulletinBoard {
  pgSubscriber: Subscriber;
  constructor(pgSubscriber: Subscriber) {
    this.pgSubscriber = pgSubscriber;
  }

  create: grpc.handleUnaryCall<messages.NewBulletin, messages.Result> = async (
    call,
    callback
  ) => {
    const result = new messages.Result();
    const bulletinRepository = getRepository(Bulletin);
    const bulletinRequest = call.request;
    const userRepository = getRepository(User);
    const userRequest = bulletinRequest.getUser();
    let user = new User();
    user.id = userRequest.getId();
    user.name = userRequest.getName();
    user.email = userRequest.getEmail();
    if (await userRepository.findOne(userRequest.getId())) {
      user = await userRepository.findOne(userRequest.getId());
    } else {
      if (!(user.name.length > 0 && user.email.length > 0)) {
        result.setStatus("error");
        result.setErrorMsg("User with this ID does not exist.");
        callback(null, result);
      }
      user = await userRepository.save(user);
    }
    try {
      const bulletin = new Bulletin();
      bulletin.title = bulletinRequest.getTitle();
      bulletin.text = bulletinRequest.getText();
      bulletin.user = user;
      await bulletinRepository.insert(bulletin);
      await this.pgSubscriber.notify("create-channel", bulletin);
      result.setStatus("success");
      callback(null, result);
    } catch (err) {
      result.setStatus("error");
      result.setErrorMsg(err.toString());
      callback(null, result);
    }
  };

  update: grpc.handleUnaryCall<
    messages.UpdatedBulletin,
    messages.Result
  > = async (call, callback) => {
    const result = new messages.Result();
    const bulletinUpdate = call.request;
    const bulletinRepository = getRepository(Bulletin);
    try {
      const queryResult = await bulletinRepository.update(
        bulletinUpdate.getId(),
        {
          ...(bulletinUpdate.getTitle().length > 0 && {
            title: bulletinUpdate.getTitle()
          }),
          ...(bulletinUpdate.getText().length > 0 && {
            text: bulletinUpdate.getText()
          })
        }
      );
      if (queryResult.affected) {
        result.setStatus("success");
        const updatedBulletin = await bulletinRepository.findOne(
          bulletinUpdate.getId(),
          { relations: ["user"] }
        );
        await this.pgSubscriber.notify("update-channel", updatedBulletin);
      } else {
        result.setStatus("error");
        result.setErrorMsg("Bulletin with this id does not exist.");
      }
      callback(null, result);
    } catch (err) {
      result.setStatus("error");
      result.setErrorMsg(err.toString());
      callback(null, result);
    }
  };

  delete: grpc.handleUnaryCall<messages.BulletinId, messages.Result> = async (
    call,
    callback
  ) => {
    const bulletinId = call.request.getId();
    const result = new messages.Result();
    const bulletinRepository = getRepository(Bulletin);
    try {
      if ((await bulletinRepository.delete(bulletinId)).affected) {
        result.setStatus("success");
        await this.pgSubscriber.notify("delete-channel", bulletinId);
        callback(null, result);
      } else {
        result.setStatus("error");
        result.setErrorMsg("Bulletin with this id doesn't exist.");
        callback(null, result);
      }
    } catch (err) {
      result.setStatus("error");
      result.setErrorMsg(err.toString());
    }
  };

  _list = async (call, userId?: number) => {
    await Promise.all([
      this.pgSubscriber.listenTo("create-channel"),
      this.pgSubscriber.listenTo("update-channel"),
      this.pgSubscriber.listenTo("delete-channel")
    ]);
    const bulletinRepository = getRepository(Bulletin);
    try {
      const stream = userId
        ? await bulletinRepository
            .createQueryBuilder("bulletin")
            .leftJoinAndSelect("bulletin.user", "user")
            .where("user.id = :id", { id: userId })
            .stream()
        : await bulletinRepository
            .createQueryBuilder("bulletin")
            .leftJoinAndSelect("bulletin.user", "user")
            .stream();
      stream.on("data", (data) => {
        const bulletinResponse = new messages.Bulletin();
        const userResponse = new messages.User();
        bulletinResponse.setId(data.bulletin_id);
        bulletinResponse.setTitle(data.bulletin_title);
        bulletinResponse.setText(data.bulletin_text);
        userResponse.setId(data.user_id);
        userResponse.setName(data.user_name);
        userResponse.setEmail(data.user_email);
        bulletinResponse.setUser(userResponse);
        call.write(bulletinResponse);
      });
      this.pgSubscriber.notifications.on(
        "create-channel",
        (bulletin: Bulletin) => {
          console.log("created bulletin:", bulletin.id);
          const bulletinResponse = new messages.Bulletin();
          const userResponse = new messages.User();
          bulletinResponse.setId(bulletin.id);
          bulletinResponse.setTitle(bulletin.title);
          bulletinResponse.setText(bulletin.text);
          userResponse.setId(bulletin.user.id);
          userResponse.setName(bulletin.user.name);
          userResponse.setEmail(bulletin.user.email);
          bulletinResponse.setUser(userResponse);
          call.write(bulletinResponse);
        }
      );
      this.pgSubscriber.notifications.on(
        "update-channel",
        (bulletin: Bulletin) => {
          console.log("updated bulletin:", bulletin.id);
          const bulletinResponse = new messages.Bulletin();
          const userResponse = new messages.User();
          bulletinResponse.setId(bulletin.id);
          bulletinResponse.setTitle(bulletin.title);
          bulletinResponse.setText(bulletin.text);
          userResponse.setId(bulletin.user.id);
          userResponse.setName(bulletin.user.name);
          userResponse.setEmail(bulletin.user.email);
          bulletinResponse.setUser(userResponse);
          call.write(bulletinResponse);
        }
      );
      this.pgSubscriber.notifications.on("delete-channel", (id: number) => {
        console.log(`Bulletin with id: ${id} has been deleted`);
      });
    } catch (err) {
      call.write(null, err.toString());
    }
  };

  list: grpc.handleServerStreamingCall<
    messages.Empty,
    messages.Bulletin
  > = async (call) => {
    await this._list(call);
  };

  listByUser: grpc.handleServerStreamingCall<
    messages.UserId,
    messages.Bulletin
  > = async (call) => {
    const userId = call.request.getId();
    await this._list(call, userId);
  };
}
