// TODO: Use Typeorm instead of knex
import * as grpc from "grpc";
import createSubscriber from "pg-listen";
import { createConnection, getConnectionOptions } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as services from "../generated/bulletin_board_grpc_pb";
import { BulletinBoard } from "./modules/BulletinBoard";

const main = async () => {
  try {
    const config = (await getConnectionOptions(
      process.env.NODE_ENV === "development" ? "development" : "production"
    )) as PostgresConnectionOptions;
    try {
      const pgSubscriber = createSubscriber({
        connectionString: `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
      });
      await pgSubscriber.connect();
      try {
        await createConnection({ ...config, name: "default" });
        const server = new grpc.Server();
        const bulletinBoard = new BulletinBoard(pgSubscriber);
        server.addService(services.BulletinBoardService, {
          createBulletin: bulletinBoard.create,
          updateBulletin: bulletinBoard.update,
          deleteBulletin: bulletinBoard.delete,
          listBulletins: bulletinBoard.list,
          listBulletinsByUser: bulletinBoard.listByUser
        });
        server.bind("0.0.0.0:50051", grpc.ServerCredentials.createInsecure());
        server.start();
        console.log("Server is running on http://localhost:50051");
      } catch (err) {
        throw new Error(err);
      }
    } catch (err) {
      throw new Error(err);
    }
  } catch (err) {
    throw new Error(err);
  }
};

main().catch((err) => {
  console.error(err);
});
