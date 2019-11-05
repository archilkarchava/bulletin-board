import * as grpc from "grpc";
import * as services from "../generated/bulletin_board_grpc_pb";
import * as messages from "../generated/bulletin_board_pb";

const main = () => {
  const bulletinBoard = new services.BulletinBoardClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  // const call = bulletinBoard.listBulletins(new messages.Empty());
  // call
  //   .on("data", (bulletin: messages.Bulletin) => {
  //     console.log(
  //       `ID: ${bulletin.getId()}
  // Title: ${bulletin.getTitle()}
  // Text: ${bulletin.getText()}
  // Created by:
  //   UserID: ${bulletin.getUser().getId()}
  //   Name: ${bulletin.getUser().getName()}
  //   Email: ${bulletin.getUser().getEmail()}`
  //     );
  //   })
  //   .on("error", (err) => console.error(err));

  const userId = new messages.UserId();
  userId.setId(3);
  const call = bulletinBoard.listBulletinsByUser(userId);
  call
    .on("data", (bulletin: messages.Bulletin) => {
      console.log(
        `ID: ${bulletin.getId()}
  Title: ${bulletin.getTitle()}
  Text: ${bulletin.getText()}
  Created by:
    UserID: ${bulletin.getUser().getId()}
    Name: ${bulletin.getUser().getName()}
    Email: ${bulletin.getUser().getEmail()}`
      );
    })
    .on("error", (err) => console.error(err));

  // const bulletin = new messages.NewBulletin();
  // const user = new messages.User();
  // bulletin.setTitle("Selling anotha fridge");
  // bulletin.setText("I AM SERIUS!!!");
  // user.setId(3);
  // bulletin.setUser(user);
  // bulletinBoard.createBulletin(bulletin, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   console.log(res.getStatus());
  // });

  // const bulletinId = new messages.BulletinId();
  // bulletinId.setId(4);
  // bulletinBoard.deleteBulletin(bulletinId, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   console.log(res.getStatus());
  // });

  // const updatedBulletin = new messages.UpdatedBulletin();
  // updatedBulletin.setId(1);
  // updatedBulletin.setTitle("Zdarov");
  // updatedBulletin.setText("Bratya i Sestry");
  // bulletinBoard.updateBulletin(updatedBulletin, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   console.log(res.getStatus());
  //   if (res.getStatus() === "error") {
  //     console.error(res.getErrorMsg());
  //   }
  // });
};

main();
