#include <gd.h>


void resize(const char*,const char*,int ,int);
gdImagePtr loadImageJpeg(const char*);
void makeDesktop(const char*);
void makeMobile(const char*);
void makeThumbnail(const char*);

void process_it(char* name);
