

#include <libwebsockets.h>


#include "structs.h"

struct per_vhost_data__minimal *myvhd;


/*
struct per_session_data__minimal* search_for_pss(int sockfd){



	lws_start_foreach_llp(struct per_session_data__minimal **,ppss,myvhd->pss_list){
	
		printf("this is fds %d\n",(*ppss)->fds);


		if((*ppss)->fds == sockfd)
			return *ppss;

	}lws_end_foreach_llp(ppss,pss_list);
}


bool peer_msg_buff_nonempty(int sockfd){

	struct per_session_data__minimal *pss = search_for_pss(sockfd);


	if(pss ==NULL )
		return false;

	int ret = ring_buffer_is_empty(&pss->ringbuffer);

	if(ret == 0)
		return true;
	else 
		return false;


}


size_t stats_recv(int sockfd,void *buff,size_t len,int flags){
	
	struct per_session_data__minimal *pss = search_for_pss(sockfd);

	if(pss == NULL)
		return 0;


	ring_buffer_size_t cnt = ring_buffer_dequeue_arr(&pss->ringbuffer,(char*)buff,len);

	return cnt;

}

//check async
//
//
//
//


size_t stats_send(int sockfd,const void *buff,size_t len , int flags){

	struct per_session_data__minimal *pss = search_for_pss(sockfd);


	if(pss == NULL)
		return 0;


	
	struct buffer ws_buffer;


	ws_buffer.data = buff;
	ws_buffer.size = len;

	
	pss->chain = &ws_buffer;

	lws_callback_on_writable(pss->wsi);

	return len;

}

*/
int set_vhd(void *vhd){

 	if(vhd == NULL) 
		return -1;


	myvhd = (struct per_vhost_data__minimal *)vhd;


	return 0;

}

