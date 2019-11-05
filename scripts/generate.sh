#! /bin/env sh

mkdir -p ./generated
rm ./generated/*

yarn run grpc_tools_node_protoc \
--js_out=import_style=commonjs,binary:./generated \
--grpc_out=./generated \
--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
--ts_out=./generated \
-I ./protos \
./protos/*.proto \
\
