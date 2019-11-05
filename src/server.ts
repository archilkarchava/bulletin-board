// TODO: Use Typeorm instead of knex
import * as grpc from "grpc";
import { createConnection, getConnectionOptions } from "typeorm";
import * as services from "../generated/bulletin_board_grpc_pb";
import { BulletinBoard } from "./modules/BulletinBoard";

const main = () => {
  getConnectionOptions(
    process.env.NODE_ENV === "development" ? "development" : "production"
  )
    .then((config) => {
      createConnection({ ...config, name: "default" })
        .then(() => {
          const server = new grpc.Server();
          server.addService(services.BulletinBoardService, {
            createBulletin: BulletinBoard.create,
            updateBulletin: BulletinBoard.update,
            deleteBulletin: BulletinBoard.delete,
            listBulletins: BulletinBoard.list,
            listBulletinsByUser: BulletinBoard.listByUser
          });
          server.bind("0.0.0.0:50051", grpc.ServerCredentials.createInsecure());
          server.start();
          console.log("Server is running on http://localhost:50051");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

main();
