import * as grpc from "grpc";
import * as services from "../generated/bulletin_board_grpc_pb";
import * as messages from "../generated/bulletin_board_pb";

const main = () => {
  const bulletinBoard = new services.BulletinBoardClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  //   const call = bulletinBoard.listBulletins(new messages.Empty());
  //   call
  //     .on("data", (bulletin: messages.Bulletin) => {
  //       console.log(
  //         `ID: ${bulletin.getId()}
  // Title: ${bulletin.getTitle()}
  // Text: ${bulletin.getText()}
  // Created by:
  //   UserID: ${bulletin.getUser().getId()}
  //   Name: ${bulletin.getUser().getName()}
  //   Email: ${bulletin.getUser().getEmail()}`
  //       );
  //     })
  //     // .on("end", () => {
  //     //   console.log("Stream closed.");
  //     // })
  //     .on("error", (err) => {
  //       throw err;
  //     });

  //   const userId = new messages.UserId();
  //   userId.setId(2);
  //   const call = bulletinBoard.listBulletinsByUser(userId);
  //   call
  //     .on("data", (bulletin: messages.Bulletin) => {
  //       console.log(
  //         `ID: ${bulletin.getId()}
  // Title: ${bulletin.getTitle()}
  // Text: ${bulletin.getText()}
  // Created by:
  //   UserID: ${bulletin.getUser().getId()}
  //   Name: ${bulletin.getUser().getName()}
  //   Email: ${bulletin.getUser().getEmail()}`
  //       );
  //     })
  //     .on("error", (err) => {
  //       throw err;
  //     });

  // const bulletin = new messages.NewBulletin();
  // const user = new messages.User();
  // bulletin.setTitle("I am Artyom!");
  // bulletin.setText("Remember my name please.");
  // user.setName("Artyom");
  // user.setEmail("art@gmail.com");
  // bulletin.setUser(user);
  // bulletinBoard.createBulletin(bulletin, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   if (res.getStatus() === "error") {
  //     console.error("Error:", res.getErrorMsg());
  //   } else {
  //     console.log(res.getStatus());
  //   }
  // });

  // const bulletin = new messages.NewBulletin();
  // const user = new messages.User();
  // bulletin.setTitle("Selling a car");
  // bulletin.setText("DAS RITE");
  // user.setName("Bobby Bill");
  // user.setEmail("billy@ya.ru");
  // bulletin.setUser(user);
  // bulletinBoard.createBulletin(bulletin, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   if (res.getStatus() === "error") {
  //     console.error("Error:", res.getErrorMsg());
  //   } else {
  //     console.log(res.getStatus());
  //   }
  // });

  // const bulletinId = new messages.BulletinId();
  // bulletinId.setId(1);
  // bulletinBoard.deleteBulletin(bulletinId, (err, res) => {
  //   if (err) {
  //     throw new Error(err.message);
  //   }
  //   console.log(res.getStatus());
  // });

  const updatedBulletin = new messages.UpdatedBulletin();
  updatedBulletin.setId(7);
  updatedBulletin.setTitle("Not sellin da car");
  updatedBulletin.setText("Pls no coll me");
  bulletinBoard.updateBulletin(updatedBulletin, (err, res) => {
    if (err) {
      throw new Error(err.message);
    }
    console.log(res.getStatus());
    if (res.getStatus() === "error") {
      console.error(res.getErrorMsg());
    }
  });
};

main();
