
FILE=server

if [ -f "$FILE"];then
	rm "$FILE"
fi


gcc -w -o server -I/usr/include/postgresql minimal-ws-server.c ringbuffer.c gdp.c  structs.c list.c sha1.c -lwebsockets -ljansson -lpq -lgdal -lcrypt -lssl -lcrypto -lhiredis -lgd -ljpeg -lm -lz

