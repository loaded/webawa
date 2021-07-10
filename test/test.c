
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>

#include <unistd.h>

int main(){
	

	struct timeval t1,t2;


	gettimeofday(&t1,NULL);
	sleep(10);

	gettimeofday(&t2,NULL);

	double elapsedTime = (t2.tv_sec -t1.tv_sec);

	printf("sleep %lf\n",elapsedTime);

	const char *arr = "adnan";

	printf("%d",strlen(arr));


	return 0;
}
