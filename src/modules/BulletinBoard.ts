import * as grpc from "grpc";
import { getRepository } from "typeorm";
import * as messages from "../../generated/bulletin_board_pb";
import { Bulletin } from "../entity/Bulletin";
import { User } from "../entity/User";

export class BulletinBoard {
  static create: grpc.handleUnaryCall<
    messages.NewBulletin,
    messages.Result
  > = async (call, callback) => {
    const result = new messages.Result();
    const userRepository = getRepository(User);
    const userRequest = call.request.getUser();
    let user = new User();
    user.id = userRequest.getId();
    user.name = userRequest.getName();
    user.email = userRequest.getEmail();
    if (await userRepository.findOne(userRequest.getId())) {
      user = await userRepository.findOne(userRequest.getId());
    } else {
      user = await userRepository.save(user);
    }
    try {
      const bulletinRepository = getRepository(Bulletin);
      const bulletin = new Bulletin();
      bulletin.title = call.request.getTitle();
      bulletin.text = call.request.getText();
      bulletin.user = user;
      await bulletinRepository.insert(bulletin);
      result.setStatus("success");
      callback(null, result);
    } catch (err) {
      result.setStatus("error");
      result.setErrorMsg(err.toString());
      callback(null, result);
    }
  };

  static update: grpc.handleUnaryCall<
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

  static delete: grpc.handleUnaryCall<
    messages.BulletinId,
    messages.Result
  > = async (call, callback) => {
    const bulletinId = call.request.getId();
    const result = new messages.Result();
    const bulletinRepository = getRepository(Bulletin);
    try {
      if ((await bulletinRepository.delete(bulletinId)).affected) {
        result.setStatus("success");
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

  static listByUser: grpc.handleServerStreamingCall<
    messages.UserId,
    messages.Bulletin
  > = async (call) => {
    const bulletinRepository = getRepository(Bulletin);
    const userId = call.request.getId();
    const bulletins = await bulletinRepository.find({
      where: { user: { id: userId } },
      relations: ["user"]
    });
    for (const bulletin of bulletins) {
      const bulletinResponse = new messages.Bulletin();
      bulletinResponse.setId(bulletin.id);
      bulletinResponse.setTitle(bulletin.title);
      bulletinResponse.setText(bulletin.text);
      const userResponse = new messages.User();
      userResponse.setId(bulletin.user.id);
      userResponse.setName(bulletin.user.name);
      userResponse.setEmail(bulletin.user.email);
      bulletinResponse.setUser(userResponse);
      call.write(bulletinResponse);
    }
  };

  static list: grpc.handleServerStreamingCall<
    messages.Empty,
    messages.Bulletin
  > = async (call) => {
    const bulletinRepository = getRepository(Bulletin);
    const bulletins = await bulletinRepository.find({ relations: ["user"] });
    // const s = await bulletinRepository
    //   .createQueryBuilder("bulletin")
    //   // .where("bulletin.userId = :id", { id: 3 })
    //   .select()
    //   .stream();
    // s.on("data", (data) => {
    //   console.log(JSON.stringify(data, null, 2));
    // });
    // const s = await queryRunner.stream(`SELECT * FROM bulletin`);
    // s.on("data", (data) => {
    //   console.log(data);
    // });
    // s.on("end", () => {
    //   queryRunner.release();
    // });
    // s.on("error", () => {
    //   queryRunner.release();
    // });
    for (const bulletin of bulletins) {
      const bulletinResponse = new messages.Bulletin();
      bulletinResponse.setId(bulletin.id);
      bulletinResponse.setTitle(bulletin.title);
      bulletinResponse.setText(bulletin.text);
      const userResponse = new messages.User();
      userResponse.setId(bulletin.user.id);
      userResponse.setName(bulletin.user.name);
      userResponse.setEmail(bulletin.user.email);
      bulletinResponse.setUser(userResponse);
      call.write(bulletinResponse);
    }
  };
}
