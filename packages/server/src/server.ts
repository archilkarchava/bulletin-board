import * as grpc from 'grpc';
import * as services from '../../../generated/helloworld_grpc_pb';
import * as messages from '../../../generated/helloworld_pb';

const sayHello = (call: { request: messages.HelloRequest }, callback: (err: grpc.ServiceError, response: messages.HelloReply) => void) => {
    const reply = new messages.HelloReply();
    reply.setMessage(`Hello ${call.request.getName()}`)
    callback(null, reply)
}

const main = () => {
    const server = new grpc.Server();
    server.addService(services.GreeterService, { sayHello: sayHello });
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('Server is running on http://localhost:50051')
}

main();