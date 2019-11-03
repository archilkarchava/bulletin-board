import * as grpc from 'grpc';
import * as services from '../../../generated/helloworld_grpc_pb';
import * as messages from '../../../generated/helloworld_pb';

const main = () => {
    const greeter = new services.GreeterClient('localhost:50051', grpc.credentials.createInsecure())
    let user;
    if (process.argv.length >= 3) {
        user = process.argv[2];
    } else {
        user = 'world';
    }

    const msg = new messages.HelloRequest()
    msg.setName(user);

    greeter.sayHello(msg, (_: grpc.ServiceError, response: messages.HelloReply) => {
        console.log('Greeting:', response.getMessage());
    })
}

main();