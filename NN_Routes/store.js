import {ACC_CONTROL,HMAC,BODY,PRIVIL,BLAKE3,PARSE_JSON,SAFE_ADD,LOG} from '../NN_Space/utils.js'

import CACHE from '../NN_Essences/primitivecache.js'

import {store,exchangeS} from '../nn.js'





//_______________________________________________________________INTERNAL________________________________________________________________________




let PUSH_STORE_CONTROL=hash=>{
    
    STORE_CONTROL.length<CONFIG.EXPORT_STORE.BUF_MAX_LEN
    ?
    STORE_CONTROL.push(hash)
    :
    exchangeS.put(STORE_CONTROL[0],STORE_CONTROL.splice(0,STORE_CONTROL.length,hash)).catch(e=>'')

},


cache=new CACHE(CONFIG.CACHES.STORE.SIZE)






//____________________________________________________________EXTERNAL POOL______________________________________________________________________




export let




getData=async(a,q,allowedGET,maxAge,cacheObj,db)=>{

    if(allowedGET){
        
        let hash=q.getParameter(0)
    
        a
        .writeHeader('Access-Control-Allow-Origin','*')
        .writeHeader('Cache-Control','max-age='+maxAge)
        .onAborted(()=>a.aborted=true)
        
        let send=cacheObj.get(hash)  ||  await db.get(hash).then(v=>{  cacheObj.set(hash,v)  ;  return v  }).catch(e=>'')
        
        !a.aborted&&a.end(send)
        
    }else a.end('Route is off')

},




//CONFIG.IMPORT_BRANCHCOMS
importData=(a,tag,db)=>{
    
    let total=0,buf=Buffer.alloc(0),
    
        importConfigs=CONFIG['IMPORT_'+tag],
        
        snapPart=SNAPSHOT['IMPORT_'+tag],

        trigger=CONFIG.TRIGGERS['IMPORT_'+tag]




    a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async(chunk,last)=>{
    

        //Dynamically track trigger's state to immidiately stop/start accept data
        if(!trigger){
            
            !a.aborted&&a.end('Route is off')
            
            return
        
        }

        if(total+chunk.byteLength<=importConfigs.PAYLOAD){
            
            buf=await SAFE_ADD(buf,chunk,a)//build full data from chunks

            total+=chunk.byteLength
            
            if(last){
                
                
                let b=await PARSE_JSON(buf)
    
                if(typeof b.c==='string'&&importConfigs.SCOPE[b.c]&&typeof b.f==='string'&&snapPart.IMPORTED!==importConfigs.MAX_IMPORT){
    
                    let timestamp=new Date().getTime()

                    //If something wrong with integrity-deny data and send '0' without increasing nonce(another side also won't change nonce)
                    //This way we'll check and accept resources only in case of integrity(check via HMAC-BLAKE3)
                    
                    if(!HMAC(JSON.stringify(b.d),importConfigs.SCOPE[b.c].sid,b.t,b.f) || (timestamp-b.t)/60000>5){
    
                        !a.aborted&&a.end('HMAC failed')

                        LOG(`IMPORT_${tag} from \x1b[36;1m${Buffer.from(a.getRemoteAddressAsText()).toString('utf-8')}\u001b[38;5;3m failed`,'W')
                        
                        return

                    }

                    !a.aborted&&a.end('OK')

                    //__________________________________________MAIN LOGIC__________________________________________


                    let hashes=Object.keys(b.d).slice(0,importConfigs.MAX_IMPORT-snapPart.IMPORTED)
                

                    hashes.forEach(hash=>
                     
                        db.get(hash).then(_data=>LOG(`${tag} -> ${hash} \x1b[32;1malready locally`,'I')).catch(e=>

                            e.notFound
                            ?
                            db.put(hash,b.d[hash]).then(()=>snapPart.IMPORTED++).catch(e=>LOG(`Unable to save locally \x1b[36;1m${tag} -> ${hash}`,'W'))
                            :
                            LOG(`Unable to save locally \x1b[36;1m${tag} -> ${hash}\n \x1b[31;1mReason:${e}`,'W')

                        )
            
                    )
                
                }else !a.aborted&&a.end('Overview failed')
        
            }

        }else !a.aborted&&a.end('Payload is too big')
    
    })

},




FLUSH_CACHE=(cache,type,shouldStop,stopLabel)=>{

    LOG(`${type} cache is going to be flushed.Size is ———> ${cache.cache.size}`,'I')

    
    
    let {FLUSH_LIMIT,TTL}=CONFIG.CACHES[type]
    
    //Go through slice(from the beginning(least used) to <FLUSH_LIMIT>(if setted) OR whole cache size) of accounts in cache
    for(let i=0,l=Math.min(cache.cache.size,FLUSH_LIMIT);i<l;i++) cache.cache.delete(cache.cache.keys().next().value)



    global[stopLabel]=setTimeout(()=>FLUSH_CACHE(cache,type,shouldStop,stopLabel),TTL)

    global[shouldStop]&&clearTimeout(global[stopLabel])

},




S={




//_______________________________________________________________GET STORE_______________________________________________________________________


    getStore:(a,q)=>getData(a,q,CONFIG.TRIGGERS.GET_STORE,CONFIG.TTL.STORE,cache,store),


//____________________________________________________LEVELS OF INTEGRATION WITH STORE___________________________________________________________




    //To save more different links for sources of respectively news
    //MSG ---> {c:'2dtMmYHpLLb25l5LUktwFvIgQ5dhK54X4Mw0sEhdyAc=',d:['hash','extra_href'],f:'fullhash'}
    stor1:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{

        if(CONFIG.STORE1_PERM===SNAPSHOT.STORE1||!CONFIG.TRIGGERS.STORE1){
            
            !a.aborted&&a.end('Route is off or no more space')
            
            return
        
        }
        

        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
        

        typeof b.c==='string' && typeof b.d?.[0]==='string' && typeof b.d[1]==='string'
        &&
        b.d[1][0]!=='{'//check if it isn't fullNews object
        &&
        b.d[0].length===64&&b.d[1].length<=CONFIG.STORE1_HREF_LEN&&await ACC_CONTROL(b.c,b.d[0]+b.d[1],b.f,1)
        ?
        store.get(b.d[0]).then(v=>!a.aborted && a.end('Exists')).catch(e=>
            
            e.notFound
            ?
            store.put(b.d[0],b.d[1]).then(()=>{
                
                !a.aborted&&a.end('OK')
                
                SNAPSHOT.STORE1++
                
                CONFIG.EXPORT_STORE.HANDLE_EVEN_IF_STOP&&PUSH_STORE_CONTROL(b.d[0])
            
            })
            :
            !a.aborted&&a.end('DB error')
        
        ).catch(e=>!a.aborted&&a.end('DB error'))
        :
        !a.aborted&&a.end('Verification failed')

    }),
      
    

    
    //To save full news created by you or by someone from Information Empire
    //{d:{c:'2dtMmYHpLLb25l5LUktwFvIgQ5dhK54X4Mw0sEhdyAc=',i:'input+fultext',r:'refs and materials',s:'signature'}
    
    stor2:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
        
        if(CONFIG.STORE2_PERM===SNAPSHOT.STORE2 || !CONFIG.TRIGGERS.STORE2){
            
            !a.aborted&&a.end('Route is off or no more space')
            
            return
        
        }
        
        
        let b=await BODY(v,CONFIG.EXTENDED_PAYLOAD_SIZE),fullnews,hash,json,
        


        allow=

        typeof b.d?.c==='string'&&typeof b.d.i==='string'&&typeof b.d.r==='string'&&typeof b.d.s==='string'
        &&
        b.d.i.length<=CONFIG.STORE2_INPUT_LEN&&b.d.r.length<=CONFIG.STORE2_REFS_LEN
        &&
        await ACC_CONTROL(b.d.c, b.d.i+b.d.r+b.d.s, b.f, 1, PRIVIL)
        
        

        
        if(allow){

            //Normalize object
            fullnews={
                
                c:b.d.c,
                i:b.d.i,
                r:b.d.r,
                s:b.d.s

            }
            
            json=JSON.stringify(fullnews)
            
            hash=BLAKE3(json)
            
            store.put(hash,json).then(()=>{
                
                !a.aborted&&a.end('OK')
                
                SNAPSHOT.STORE2++
                
                CONFIG.EXPORT_STORE.HANDLE_EVEN_IF_STOP&&PUSH_STORE_CONTROL(hash)
            
            }).catch(e=>!a.aborted&&a.end('DB error'))

        }else !a.aborted&&a.end('Overview failed')

    }),




//____________________________________________________________IMPORT SECTION_____________________________________________________________________


    importStore:a=>importData(a,'STORE',store)

}

//...to flush cache every TTL milliseconds
//There is ability to stop this process or not execute if TTL=0
CONFIG.CACHES.STORE.TTL!=0&&setTimeout(()=>FLUSH_CACHE(cache,'STORE','STOP_FLUSH_STORE_CACHE','CLEARTIMEOUT_STORE'),CONFIG.CACHES.STORE.DELAY)