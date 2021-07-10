#include <math.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <errno.h>
#include <ctype.h>
#include <dirent.h>
#include <gd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <string.h>
#include <jpeglib.h>
//--------------------------------------------------------------------------

#ifdef _WIN32
    #include <sys/utime.h>

    // Make the Microsoft Visual c 10 deprecate warnings go away.
    // The _CRT_SECURE_NO_DEPRECATE doesn't do the trick like it should.
    #define unlink _unlink
    #define chmod _chmod
    #define access _access
    #define mktemp _mktemp
#else
    #include <utime.h>
    #include <sys/types.h>
    #include <unistd.h>
    #include <errno.h>
    #include <limits.h>
#endif

#define M_SOF0  0xC0          // Start Of Frame N
#define M_SOF1  0xC1          // N indicates which compression process
#define M_SOF2  0xC2          // Only SOF0-SOF2 are now in common use
#define M_SOF3  0xC3
#define M_SOF5  0xC5          // NB: codes C4 and CC are NOT SOF markers
#define M_SOF6  0xC6
#define M_SOF7  0xC7
#define M_SOF9  0xC9
#define M_SOF10 0xCA
#define M_SOF11 0xCB
#define M_SOF13 0xCD
#define M_SOF14 0xCE
#define M_SOF15 0xCF
#define M_SOI   0xD8          // Start Of Image (beginning of datastream)
#define M_EOI   0xD9          // End Of Image (end of datastream)
#define M_SOS   0xDA          // Start Of Scan (begins compressed data)
#define M_JFIF  0xE0          // Jfif marker
#define M_EXIF  0xE1          // Exif marker.  Also used for XMP data!


typedef unsigned char uchar;
const int BytesPerFormat[] = {0,1,1,2,4,8,1,1,2,4,8,4,8};
#define NUM_FORMATS 12

#define TAG_ORIENTATION            0x0112

#define FMT_BYTE       1 
#define FMT_STRING     2
#define FMT_USHORT     3
#define FMT_ULONG      4
#define FMT_URATIONAL  5
#define FMT_SBYTE      6
#define FMT_UNDEFINED  7
#define FMT_SSHORT     8
#define FMT_SLONG      9
#define FMT_SRATIONAL 10
#define FMT_SINGLE    11
#define FMT_DOUBLE    12

#define TRUE 1
#define FALSE 0

int MotorolaOrder = 0;
int orientation = 0;
int im_height = 0;
int im_width = 0;

static void * OrientationPtr;
static int    OrientationNumFormat;

int Get32s(void * Long)
{
    if (MotorolaOrder){
        return  ((( char *)Long)[0] << 24) | (((uchar *)Long)[1] << 16)
              | (((uchar *)Long)[2] << 8 ) | (((uchar *)Long)[3] << 0 );
    }else{
        return  ((( char *)Long)[3] << 24) | (((uchar *)Long)[2] << 16)
              | (((uchar *)Long)[1] << 8 ) | (((uchar *)Long)[0] << 0 );
    }
}




unsigned Get32u(void * Long)
{
    return (unsigned)Get32s(Long) & 0xffffffff;
}




//--------------------------------------------------------------------------
// Convert a 16 bit unsigned value to file's native byte order
//--------------------------------------------------------------------------
static void Put16u(void * Short, unsigned short PutValue)
{
    if (MotorolaOrder){
        ((uchar *)Short)[0] = (uchar)(PutValue>>8);
        ((uchar *)Short)[1] = (uchar)PutValue;
    }else{
        ((uchar *)Short)[0] = (uchar)PutValue;
        ((uchar *)Short)[1] = (uchar)(PutValue>>8);
    }
}

//--------------------------------------------------------------------------
// Convert a 16 bit unsigned value from file's native byte order
//--------------------------------------------------------------------------
int Get16u(void * Short)
{
    if (MotorolaOrder){
        return (((uchar *)Short)[0] << 8) | ((uchar *)Short)[1];
    }else{
        return (((uchar *)Short)[1] << 8) | ((uchar *)Short)[0];
    }
}


void Put32u(void * Value, unsigned PutValue)
{
    if (MotorolaOrder){
        ((uchar *)Value)[0] = (uchar)(PutValue>>24);
        ((uchar *)Value)[1] = (uchar)(PutValue>>16);
        ((uchar *)Value)[2] = (uchar)(PutValue>>8);
        ((uchar *)Value)[3] = (uchar)PutValue;
    }else{
        ((uchar *)Value)[0] = (uchar)PutValue;
        ((uchar *)Value)[1] = (uchar)(PutValue>>8);
        ((uchar *)Value)[2] = (uchar)(PutValue>>16);
        ((uchar *)Value)[3] = (uchar)(PutValue>>24);
    }
}


double ConvertAnyFormat(void * ValuePtr, int Format)
{
    double Value;
    Value = 0;

    switch(Format){
        case FMT_SBYTE:     Value = *(signed char *)ValuePtr;  break;
        case FMT_BYTE:      Value = *(uchar *)ValuePtr;        break;

        case FMT_USHORT:    Value = Get16u(ValuePtr);          break;
        case FMT_ULONG:     Value = Get32u(ValuePtr);          break;

        case FMT_URATIONAL:
        case FMT_SRATIONAL: 
            {
                int Num,Den;
                Num = Get32s(ValuePtr);
                Den = Get32s(4+(char *)ValuePtr);
                if (Den == 0){
                    Value = 0;
                }else{
                    if (Format == FMT_SRATIONAL){
                        Value = (double)Num/Den;
                    }else{
                        Value = (double)(unsigned)Num/(double)(unsigned)Den;
                    }
                }
                break;
            }

        case FMT_SSHORT:    Value = (signed short)Get16u(ValuePtr);  break;
        case FMT_SLONG:     Value = Get32s(ValuePtr);                break;

        // Not sure if this is correct (never seen float used in Exif format)
        case FMT_SINGLE:    Value = (double)*(float *)ValuePtr;      break;
        case FMT_DOUBLE:    Value = *(double *)ValuePtr;             break;

        default:
           break;
             //printf('5550\n');
    }
    return Value;
}


void ClearOrientation(void)
{  printf("enterrr it \n");
    switch(OrientationNumFormat){
         case FMT_SBYTE:
         case FMT_BYTE:      
             printf("fmt byte\n");
             *(uchar *)(OrientationPtr) = 1;
              break;

         case FMT_USHORT:    
              printf("ushort \n");
              Put16u(OrientationPtr, 1);                
              break;

         case FMT_ULONG:     
         case FMT_SLONG:     
              printf("slong ulong \n");
              memset(OrientationPtr, 0, 4);
              // Can't be bothered to write  generic Put32 if I only use it once.
              if (MotorolaOrder){
                ((uchar *)OrientationPtr)[3] = 1;
              }else{
                  ((uchar *)OrientationPtr)[0] = 1;
              }
              break;

         default:
             printf("default \n");
             return ;
     }
   return;
}





int  ProcessExifDir(unsigned char * DirStart, unsigned char * OffsetBase, 
        unsigned ExifLength, int NestingLevel)
{   
    int de;
    int a;
    int NumDirEntries;
    unsigned ThumbnailOffset = 0;
    unsigned ThumbnailSize = 0;
    char IndentString[25];
   
    if (NestingLevel > 4){
        return FALSE;
    }

    memset(IndentString, ' ', 25);
    IndentString[NestingLevel * 4] = '\0';


    NumDirEntries = Get16u(DirStart);
    #define DIR_ENTRY_ADDR(Start, Entry) (Start+2+12*(Entry))

    {
        unsigned char * DirEnd;
        DirEnd = DIR_ENTRY_ADDR(DirStart, NumDirEntries);
        if (DirEnd+4 > (OffsetBase+ExifLength)){
            if (DirEnd+2 == OffsetBase+ExifLength || DirEnd == OffsetBase+ExifLength){
                // Version 1.3 of jhead would truncate a bit too much.
                // This also caught later on as well.
            }else{
                return FALSE;
            }
        }
        
    }


    for (de=0;de<NumDirEntries;de++){
        int Tag, Format, Components;
        unsigned char * ValuePtr;
        int ByteCount;
        unsigned char * DirEntry;
        DirEntry = DIR_ENTRY_ADDR(DirStart, de);
        
        Tag = Get16u(DirEntry);
        Format = Get16u(DirEntry+2);
        Components = Get32u(DirEntry+4);

        if ((Format-1) >= NUM_FORMATS) {
            continue;
        }

        if ((unsigned)Components > 0x10000){
             //printf('12\n');
            continue;
        }

        ByteCount = Components * BytesPerFormat[Format];

        if (ByteCount > 4){
            unsigned OffsetVal;
            OffsetVal = Get32u(DirEntry+8);
            if (OffsetVal+ByteCount > ExifLength){
                continue;
            }
            ValuePtr = OffsetBase+OffsetVal; 

         
        }else{
            ValuePtr = DirEntry+8;
        }      
        
        if(Tag == TAG_ORIENTATION){
            orientation = (int)ConvertAnyFormat(ValuePtr, Format); 
              OrientationPtr = ValuePtr;
              OrientationNumFormat = Format;
            return TRUE;
        }
              
    }

   return FALSE;
}

int process_EXIF (unsigned char * ExifSection, unsigned int length)
{
    unsigned int FirstOffset;
    
    {   // Check the EXIF header component
        static uchar ExifHeader[] = "Exif\0\0";
        if (memcmp(ExifSection+2, ExifHeader,6)){
            return FALSE;
        }
    }

    if (memcmp(ExifSection+8,"II",2) == 0){       
        MotorolaOrder = 0;
    }else{
        if (memcmp(ExifSection+8,"MM",2) == 0){            
            MotorolaOrder = 1;
        }else{
            return FALSE;
        }
    }

    // Check the next value for correctness.
    if (Get16u(ExifSection+10) != 0x2a){
        return FALSE;
    }

    FirstOffset = Get32u(ExifSection+12);
    if (FirstOffset < 8 || FirstOffset > 16){
        if (FirstOffset < 16 || FirstOffset > length-16){
            return FALSE;
        }
    }
    
    // First directory starts 16 bytes in.  All offset are relative to 8 bytes in.
    ProcessExifDir(ExifSection+8+FirstOffset, ExifSection+8, length-8, 0);
    
    return TRUE;
    
}

int ReadJpegSections (FILE * infile)
{
    int a;   
    a = fgetc(infile);

    if (a != 0xff || fgetc(infile) != M_SOI){
        return FALSE;
    }

   
    for(;;){
        int itemlen;
        int prev;
        int marker = 0;
        int ll,lh, got;
        uchar * Data;

        //CheckSectionsAllocated();

        prev = 0;
        for (a=0;;a++){
            marker = fgetc(infile);
            if (marker != 0xff && prev == 0xff) break;
            if (marker == EOF){ 
               return FALSE;                
            }
            prev = marker;
        }

        if (a > 10){ 
          return FALSE;        	  
        }        
  
        // Read the length of the section.
        lh = fgetc(infile);
        ll = fgetc(infile);
        if (lh == EOF || ll == EOF){ 
           return FALSE;           
        }

        itemlen = (lh << 8) | ll;

        if (itemlen < 2){
            return FALSE;
        }       

        Data = (uchar *)malloc(itemlen);
        if (Data == NULL){
           return FALSE;
        }
        

        // Store first two pre-read bytes.
        Data[0] = (uchar)lh;
        Data[1] = (uchar)ll;
        
        got = fread(Data+2, 1, itemlen-2, infile); // Read the whole section.
        if (got != itemlen-2){
             return FALSE;
        }            
       
        switch(marker){
          case M_EXIF :             
              if (memcmp(Data+2, "Exif", 4) == 0){                      
                 process_EXIF(Data, itemlen);
                 return TRUE; 
                               
              }                                
        }      
    }
    return FALSE;
}

int ReadJpegFile(const char * FileName)
{
    FILE * infile;
    orientation = 0;
    infile = fopen(FileName, "rb"); // Unix ignores 'b', windows needs it.

    if (infile == NULL) { 
        return FALSE;
    }

    ReadJpegSections(infile);
    fclose(infile);

    return TRUE;
}

void resize(const char * FileName,const char* output,int width,int height){
  FILE *fp;
  gdImagePtr in,out;
   
   
   int y = 0;
   struct stat st = {0};
   char* filename = (char*) malloc(strlen(FileName) + 1);
   strcpy(filename,FileName);
   char * slash_pos = strrchr(filename,'/');
   char * f_name = slash_pos + 1;
   
  
   char* resize_file = (char*) malloc(strlen(output) + strlen(f_name) + 1);
   
   strcpy(resize_file,output);
   strcat(resize_file,f_name);
   
   
  
  
   if(stat(output,&st) == -1){
      mkdir(output,0777);            
   } else{
    
}
   
  fp = fopen(FileName,"rb");
  if(!fp){
    fprintf(stderr,"can not read image");
    return;  
  }
  
  in = gdImageCreateFromJpegEx(fp,GD_TRUE);
  
  fclose(fp);
  
  if(!in){
     fprintf(stderr,"can not create gdimage");
     return;  
  }
  
  gdImageSetInterpolationMethod(in,GD_BILINEAR_FIXED);
  out = gdImageScale(in,width,height);
 
  if(!out){
    fprintf(stderr,"can not output the file\n");
    return;  
  } 
    
  fp = fopen(resize_file,"wb");
  if(!fp){
     fprintf(stderr,"can not read output file");
     return;  
  }  
    
  gdImageJpeg(out,fp,90);
  
  fclose(fp);
  
  gdImageDestroy(in);
  gdImageDestroy(out);
  free(filename);
  free(resize_file);
  return;
    
}


gdImagePtr loadImageJpeg(const char* FileName){
  
  FILE *fp;
  gdImagePtr im;  
  fp = fopen(FileName,"rb");
  
  if(!fp){
     printf("file does not exists\n");
     return NULL;
  }  
  
  
  im = gdImageCreateFromJpeg(fp);
  if(!im){
    printf("can not create image from fp in loadImageJpeg\n");
    return NULL;
  }
  fclose(fp);
  return im;  
}




int saveJpegImage(gdImagePtr im,const char* name){
  FILE * fp;
  
  fp = fopen(name,"wb");
  if(!fp){
   printf("could not open file in saveJpegImage\n");
   return 0;  
  }
  
  gdImageJpeg(im,fp,95);
  fclose(fp);
  return 1;
}


int rotate(double angle,gdImagePtr im,const char *result){
  gdImagePtr im2;
  int new_width,new_height;
  double a2 ;
  
  
  if(!im){
    printf("could not load image ");
    return 0;  
  }
  
   gdImageSetInterpolationMethod(im,GD_NEAREST_NEIGHBOUR);
   im2 = gdImageRotateInterpolated(im,angle,0);
	
	if (!saveJpegImage(im2, result)) {
		fprintf(stderr, "Can't save jpeg file rotated.png");
		gdImageDestroy(im);
		gdImageDestroy(im2);
		return 1;
	} 

	gdImageDestroy(im2);
	gdImageDestroy(im);
	return 0;
  
}




void makeThumbnail(const char* name){
    char * thumbnails = "thumb/";
    char * result;
    int l1,l2,height,width;
    float temp;
                 
    gdImagePtr image;

    char* str_name = (char*) malloc(strlen(name) + 1);
    strcpy(str_name,name);
    char* file_name = strrchr(str_name,'/');
    file_name = file_name + 1;
    int file_name_length = strlen(file_name);
    str_name[strlen(name) - strlen(file_name)] = '\0';     
    result = (char*) malloc(strlen(thumbnails) + strlen(name) + 1);
     
    strcpy(result,str_name);
    strcat(result,thumbnails);
               
    image = loadImageJpeg(name);
    width = gdImageSX(image);
    height = gdImageSY(image);
   
           
    if(width > height ){         
      temp =(float) height/width;
      width = 150;  
      height = (int)(temp * width);
             
    }else {
      temp = (float) width/height;
      height = 150;
      width = (int)(temp * height);           
    }
    
     
    im_width = width;
    im_height = height;
    
    gdImageDestroy(image);
           
    resize(name,result,width,height); 
    free(result);
    free(str_name);
    return;
}  


void makeMobile(const char* name){ printf("start of this funck\n");
    char * thumbnails = "mobile/";
    char * result;
    int l1,l2,height,width;
    float temp;
                 
    gdImagePtr image;

    char* str_name = (char*) malloc(strlen(name) + 1);
    strcpy(str_name,name);
    char* file_name = strrchr(str_name,'/');
    file_name = file_name + 1;
    int file_name_length = strlen(file_name);
    str_name[strlen(name) - strlen(file_name)] = '\0';     
    result = (char*) malloc(strlen(thumbnails) + strlen(name) + 1);
     
    strcpy(result,str_name);
    strcat(result,thumbnails);
               
    image = loadImageJpeg(name);
    width = gdImageSX(image);
    height = gdImageSY(image);
   
           
    if(width > height ){         
      temp =(float) height/width;
      width = 500;  
      height = (int)(temp * width);
             
    }else {
      temp = (float) width/height;
      height = 500;
      width = (int)(temp * height);           
    }
    gdImageDestroy(image);
     printf("start of resize it \n");      
    resize(name,result,width,height); 
    free(result);
    free(str_name);
    return;
}  

void makeDesktop(const char* name){
    char * thumbnails = "desktop/";
    char * result;
    int l1,l2,height,width;
    float temp;
                 
    gdImagePtr image;

    char* str_name = (char*) malloc(strlen(name) + 1);
    strcpy(str_name,name);
    char* file_name = strrchr(str_name,'/');
    file_name = file_name + 1;
    int file_name_length = strlen(file_name);
    str_name[strlen(name) - strlen(file_name)] = '\0';     
    result = (char*) malloc(strlen(thumbnails) + strlen(name) + 1);
     
    strcpy(result,str_name);
    strcat(result,thumbnails);
               
    image = loadImageJpeg(name);
    width = gdImageSX(image);
    height = gdImageSY(image);
   
           
    if(width > height ){         
      temp =(float) height/width;
      width = 900;  
      height = (int)(temp * width);
             
    }else {
      temp = (float) width/height;
      height = 900;
      width = (int)(temp * height);           
    }
    

   gdImageDestroy(image);
           
    resize(name,result,width,height); 
    free(result);
    free(str_name);
    return;
}  

int process_it(char* name){
  char* str = (char*)malloc(strlen(name) + 1); // free this
  strcpy(str,name);
  gdImagePtr im;
   
  char *slash = strrchr(str,'/');
  char* pic_name= slash + 1;
  
  int stlen_slash = strlen(pic_name);
 
  
  int strln = strlen(name);
  char *filename = (char*) malloc(strln-stlen_slash +1 );
  strcpy(filename,pic_name);
  str[strln - stlen_slash] = '\0';
    
 
  char* ext = strrchr(filename,'.');
  const char* extention = ext + 1;
  
  if(strcmp(extention,"jpeg") == 0 || strcmp(extention,"jpg") == 0 || 
                               strcmp(extention,"JPEG") == 0 || strcmp(extention,"JPG") == 0 ){
        
            printf("start process it %s\n",name);
            printf("reading orientation \n");             	
         	orientation = 0;
            ReadJpegFile(name);
            printf("end reading orientation \n");         
            switch(orientation){
               case 2 :                   
                   im = loadImageJpeg(name);
                   gdImageFlipVertical(im);
                   saveJpegImage(im,name);
                   gdImageDestroy(im);
                   break;
               case 3 : 
                     im  = loadImageJpeg(name);
                     rotate(180,im,name);
                     break;
               case 4 : 
                   im = loadImageJpeg(name);
                   gdImageFlipHorizontal(im);
                   saveJpegImage(im,name);
                   gdImageDestroy(im);
                   break;
               case 5 : 
                  im = loadImageJpeg(name);
                  gdImageFlipHorizontal(im);
                  rotate(270,im,name);
                  
                  
                  break;
               case 6 : 
                  im = loadImageJpeg(name);                            	
                  rotate(270,im,name);
                  
                  break;
               case 7 : 
                  im = loadImageJpeg(name);               
                  gdImageFlipVertical(im);
                  rotate(270,im,name);
                  
                  break;
               case 8:
                   
                   im = loadImageJpeg(name);
                   
                   rotate(90,im,name);
                        
                   break;
               default : 
                  break;
            }
            
           
            printf("end rotating file \n");          
            printf("makethumb %s\n",name);
            
            
            printf("start desktop image \n");
            makeDesktop(name);
            printf("end desktop image \n");
            printf("start mobile image\n");
            makeMobile(name);
            printf("end mobile image \n");
            printf("start thumb image\n");
            makeThumbnail(name);
            printf("end thumb\n");
            printf("end this file %s\n",name);
            
            
            free(filename);
            free(str);
            
            return 1;
            
            
  }else {
      free(filename);
      free(str);
      return 0;   
  } 
}


