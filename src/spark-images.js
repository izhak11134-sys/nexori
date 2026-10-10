import { sparkImageLimit } from './spark-content.js';

export async function compressSparkImage(dataUrl) {
  const blob=await(await fetch(dataUrl)).blob();
  if(blob.size>2*1024*1024||!['image/png','image/jpeg','image/webp'].includes(blob.type))throw new Error('יש לבחור PNG, JPEG או WebP בגודל עד 2MB.');
  const bitmap=await createImageBitmap(blob);
  try {
    if(bitmap.width>8000||bitmap.height>8000)throw new Error('ממדי התמונה גדולים מדי.');
    let size=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    for(let attempt=0;attempt<5;attempt++) {
      canvas.width=Math.max(1,Math.round(bitmap.width*size));canvas.height=Math.max(1,Math.round(bitmap.height*size));
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.86,.74,.62]) {
        const result=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
        if(!result||result.type!=='image/webp')throw new Error('הדפדפן אינו תומך בהכנת תמונת WebP. נסה דפדפן עדכני.');
        if(result.size<=sparkImageLimit)return new Uint8Array(await result.arrayBuffer());
      }
      size*=.8;
    }
    throw new Error('התמונה גדולה מדי למסלול החינמי גם לאחר הקטנה. בחר תמונה פשוטה יותר.');
  } finally {bitmap.close();}
}
