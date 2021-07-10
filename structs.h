
#ifndef STRUCTS_H
#define STRUCTS_H




#include <libwebsockets.h>
#include <stdbool.h>
#include "list.h"


struct msg {
	void *payload; /* is malloc'd */
	size_t len;
};

/* one of these is created for each client connecting to us */

struct incoming_data {
	char* buf;
	struct incoming_data *next;
	int len;
};


struct upload {
	
	list_t *names;
	 char title[100];
	float x;
	float y;
	int nFiles;
	int uploaded;
	 char text[1000];
	int edit;
	int price;
	char hash[64];
};


struct buffer {

	const char *data;
	
	size_t size;

};

struct per_session_data__minimal {
	struct per_session_data__minimal *pss_list;
	struct lws *wsi;

	struct incoming_data *seq;
//	ring_buffer_t ringbuffer;
	int total ;
	

	struct buffer *chain;
	struct upload *mpload;
	
	struct incoming_data *current;	
	int fds;
	char filename[128];
	int fd;
	int state;
	int fragment;
	int start ;
	char id[100];
	struct timeval t1;
	struct timeval t2;
	int last; /* the last message number we sent */
};

/* one of these is created for each vhost our protocol is used with */

struct per_vhost_data__minimal {
	struct lws_context *context;
	struct lws_vhost *vhost;
	const struct lws_protocols *protocol;


		
	struct per_session_data__minimal *pss_list; /* linked-list of live pss*/
	
	struct msg amsg; /* the one pending message... */
	int current; /* the current message number we are caching */
};











int set_vhd(void *vhd);

struct per_session_data__minimal * search_for_pss(int sockfd);

bool peer_msg_buff_nonempty(int sockfd);
size_t stats_recv(int sockfd,void *buff,size_t len,int flags);
size_t stats_send(int sockfd ,const void *buff, size_t len,int flasgs);

#endif
