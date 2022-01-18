import {PRIVIL,ACC_CONTROL,BODY,HMAC,SEND,INV2,SAFE_ADD,PARSE_JSON,LOG, PATH_RESOLVE} from '../NN_Space/utils.js'

import CACHE from '../NN_Essences/primitivecache.js'

import MSG from '../NN_Essences/msg.js'

import {FLUSH_CACHE} from './store.js'

import {dezCA, news} from '../nn.js'

import fs from 'fs'




//______________________________________________________FUNCTIONS & VARIABLES POOL_______________________________________________________________




let

    cache=new CACHE(CONFIG.CACHES.NEWS.SIZE),
    
    NEWSBUF={a:{politics:[],sport:[],economy:[],tech:[],other:[],future:[],showbiz:[],society:[],nature:[]},e:{}},
      



    GET_NEWS=async(a,src,topic,seqId)=>{

        if(!CONFIG.TRIGGERS[src==='a'?'GET_ANY_NEWS':'GET_EMP_NEWS']) !a.aborted&&a.end('Route is off')
        
        else{

            let id=src+topic+seqId

            a
            .writeHeader('Access-Control-Allow-Origin','*')
            .writeHeader('Cache-Control','max-age='+CONFIG.TTL[src==='a'?'ANY':'EMP'])
            .onAborted(()=>a.aborted=true)


            let send=
                
                cache.get(id)
                ||//...OR get from db and push to cache
                await news[src][topic]?.get(SNAPSHOT[`${src==='a'?'ANY':'EMP'}_TOPICS_CONTROL`][topic][seqId]).then(news=>{
                
                    cache.set(id,news)
                
                    return cache.get(id)
            
                }).catch(e=>
                    
                    cache.get(src+topic+'C')//try to get from cache if it's still not flushed
                    ||
                    (
                        cache.set(src+topic+'C',JSON.stringify(NEWSBUF[src][topic])),//reload cache

                        cache.get(src+topic+'C')//...and response
                    
                    )
                    
                )
            
            
            !a.aborted && a.end(send)
        
        } 
        
    },
    



    ACCEPT_NEWS=async(a,anyOrEmpire,role)=>

    a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async bytes=>{
        
        let label=(anyOrEmpire==='a'?'ANY':'EMP')+'_NEWS_',

            body=await BODY(bytes,CONFIG.PAYLOAD_SIZE),

            free=SNAPSHOT[label+'FREE'],bufLen=CONFIG[label+'BUF_LEN']




        if(typeof body.c==='string'&&typeof body.f==='string'&&typeof body.d?.t==='string'&&typeof body.d.h==='string'){
            
            //Check if we have free buffers(then we have free place).If no free space-try to add news at least to NEWSBUF,checkin' size of array
            let freeSpace=free[0] || NEWSBUF[anyOrEmpire][body.d.t]?.length!==bufLen

            
            //If no free space or route's trigger is off-immediately response
            if(!(freeSpace||CONFIG.TRIGGERS[`SEND_${anyOrEmpire==='a'?'ANY':'EMP'}_NEWS`])) a.end('Route is off')
    
            else if(NEWSBUF[anyOrEmpire][body.d.t]  &&  freeSpace  &&  body.d.h.length<=CONFIG[label+'PREV_HREF_LEN']  &&  await ACC_CONTROL(body.c,body.d.t+body.d.h,body.f,1,role)){
                
                NEWSBUF[anyOrEmpire][body.d.t].push(body.d.h)

                !a.aborted && a.end('OK')

                cache.set(anyOrEmpire+body.d.t+'C',JSON.stringify(NEWSBUF[anyOrEmpire][body.d.t]))
    
                if(free[0] && NEWSBUF[anyOrEmpire][body.d.t].length===bufLen){
                    
                    let v=free.shift()
                                            
                    SNAPSHOT[label+'CONTROL'][body.d.t].push(v)                    
                    
                    cache.cache.delete(cache.set(anyOrEmpire+body.d.t+'C'))//no sense to save duplicates

                    news[anyOrEmpire][body.d.t].put(free[0],JSON.stringify(NEWSBUF[anyOrEmpire][body.d.t].splice(0))).catch(e=>free.push(v))
                    
                }
                
            }else !a.aborted&&a.end('Verification failed')

        }else !a.aborted&&a.end('Wrong types')

    }),




    //d[0]-topic,d[1]-array of news,fullhash with JSON.stringify(b.d)
    ACCEPT_NEWS_LIST=async(a,type)=>{

        let total=0,buf=Buffer.alloc(0),ref=type

            type=(type==='a'?'ANY':'EMP')+'_NEWS_'
        
        
        let free=SNAPSHOT[type+'FREE'],
        
            bufSize=CONFIG[type+'BUF_LEN']


        

        a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async(chunk,last)=>{

            //If route is enabled
            if(!CONFIG.TRIGGERS[`SEND_${type}LIST`]){
                
                a.end('Route is off')
                
                return
            
            }


            if(total+chunk.byteLength<=CONFIG.EXTENDED_PAYLOAD_SIZE){
            
                buf=await SAFE_ADD(buf,chunk,a)//build full data from chunks
    
                total+=chunk.byteLength
                
                if(last){

                    let body=await PARSE_JSON(buf),


                    //Complex check
                    allow=
                    
                    typeof body.c==='string'&&typeof body.f==='string'//Check formats
                    &&
                    NEWSBUF[ref][body.d?.[0]]//if we have such category
                    &&
                    CONFIG[type+'LIST_MAX']>=body.d[1]?.length//if list size is OK
                    &&
                    (free[0]||NEWSBUF[ref][body.d[0]].length!==bufSize)//if we have enough space.With <free[0]> we check that in case of full buffer we'll have place to save it,with second condition we check "can we save it at least to buffer if size of it allows"
                    &&
                    await ACC_CONTROL(body.c,JSON.stringify(body.d),body.f,CONFIG[`ADD_FOR_${type}LIST`])//Note-for lists we can add more than 1 to nonce to get to debouncing earlier and prevent spam
                


                    if(allow){
            
                        let i=0,brakeIndex
                        
                        //Better to check available space dynamically inside cycle in order to async
                        
                        for(let l=body.d[1].length;i<l;i++){
                        
                            if(typeof body.d[1][i]?.h==='string' && body.d[1][i].h.length<=CONFIG[type+'PREV_HREF_LEN']){
            
                                NEWSBUF[ref][body.d[0]].push(body.d[1][i].h)

                                if(NEWSBUF[ref][body.d[0]].length === bufSize){
                                    
                                    if(free[0]){

                                        let v=free.shift()//to prevent race condition & TOCTOU attacks

                                        SNAPSHOT[`${ref==='a'?'ANY':'EMP'}_TOPICS_CONTROL`][body.d[0]].push(v)
                                        
                                        //Even if problem with write-we can push back this bufferId for another case later
                                        news[ref][body.d[0]]
                                        
                                            .put(v,JSON.stringify(
                                                
                                                NEWSBUF[ref][body.d[0]].splice(0)
                                            
                                            )).catch(e=>free.push(v))
                                    
                                    }else{ brakeIndex=i ; break }
                                    
                                }
                            
                            }
                        
                        }
                        cache.set(ref+body.d[0]+'C',JSON.stringify(NEWSBUF[ref][body.d[0]]))
                        /**
                         * B+index where index is position of news in array
                         * To get info on which news we break the cycle and inform that sender must re-send this news(from position i)
                         * to extra sources,defined in INFO
                         * 
                         */
                        !a.aborted && a.end( brakeIndex===undefined ? 'OK':'Break on '+i )
                        
                    }else !a.aborted&&a.end('Overview failed')

                }
            
            }else !a.aborted&&a.end('Payload too big')

        })

    },




    // packet ---> {topic1:[ [] , [] , [] , [] ],  topic2:[ [] , [] , [] ], ...}
    IMPORT_NEWS=(a,type)=>{


        let total=0,buf=Buffer.alloc(0),
        
            TYPE=type==='a'?'ANY':'EMP',

            importConfigs=CONFIG[`IMPORT_${TYPE}_NEWS`],//This ∈ { IMPORT_EMP_NEWS , IMPORT_ANY_NEWS }

            free=SNAPSHOT[TYPE+'_NEWS_FREE'],

            trigger=CONFIG.TRIGGERS[`IMPORT_${TYPE}_NEWS`]



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
                    
                    let body=await PARSE_JSON(buf),SCOPE=CONFIG[`IMPORT_${TYPE}_NEWS`].SCOPE

                    console.log("ACCEPT IMPORT")//delete

                    if(typeof body.c==='string'&&typeof body.f==='string'&&free[0]&&SCOPE[body.c]){

                        let timestamp=new Date().getTime()

                        if(!HMAC(JSON.stringify(body.d),SCOPE[body.c].sid,body.t,body.f) || (timestamp-body.t)/60000>5){
                        
                            !a.aborted&&a.end('HMAC failed')
    
                            LOG(`IMPORT_${TYPE}_NEWS from \x1b[36;1m${Buffer.from(a.getRemoteAddressAsText()).toString('utf-8')}\x1b[32;1m failed`,'F')
                            
                            return
                        }else console.log('HMAC SUCCESS')//delete

                        
                        !a.aborted&&a.end('OK')
                        
                        
                        
                        
                        let packet=body.d,topics=Object.keys(packet)

                        //console.log('PACKET in import ->',packet)
                        console.log('TOPICS ',topics)
                        
                        for(let j=0,m=topics.length;j<m;j++){

                            for(let i=0,l=packet[topics[j]].length<free.length?packet[topics[j]].length:free.length;i<l;i++){
                    
                                await news[type][topics[j]].put(free[0],packet[topics[j]][i]).then(()=>{

                                    console.log('BEFORE ',SNAPSHOT[TYPE+'_TOPICS_CONTROL'][topics[j]])
                                    
                                    let id=free.shift()

                                    SNAPSHOT[TYPE+'_TOPICS_CONTROL'][topics[j]].push(id)
                                    
                                    SNAPSHOT[`EXPORT_${TYPE}_NEWS`].SEND.push(id)//Not to re-export again mark this buffer as "SEND"
                                    
                                    console.log('AFTER ',SNAPSHOT[TYPE+'_TOPICS_CONTROL'][topics[j]])


                                }).catch(e=>'')
                                
                            }

                        }
            
                    }else !a.aborted&&a.end('Wrong types or no space')

                }
            
            }else !a.aborted&&a.end('Payload too big')
        
        })

    },



    
    //Main logic to export news
    EXPORT_NEWS=async(topics,topicsControl,alreadyExportedBufs,maxBufsPerTopic,newsDB,destinate,route)=>{
            
        //bundle ---> {topic1:[0,1,28],...}
        let bundle={},packet={},sign,toSend=[]


        for(let i=0;i<topics.length;i++){

            //START HERE EXPORT
            if(topicsControl[topics[i]]) bundle[topics[i]]=topicsControl[topics[i]].filter(bufId=>!alreadyExportedBufs.includes(bufId)).slice(0,maxBufsPerTopic[topics[i]])
    
                      
            if(bundle[topics[i]].length!==0){
    
                //del
                console.log('Bundlde is ',bundle[topics[i]])
    
                packet[topics[i]]=[]
                    
                    bundle[topics[i]].forEach((newsBufferId,j)=>
                    
                        toSend.push(
                            
                            newsDB[topics[i]].get(newsBufferId).then(buf=>{
    
                                packet[topics[i]].push(buf)
                                
                                sign=true
                            
                            }).catch(e=>bundle[topics[i]].splice(j,1))//else delete this buffer from export packet
                        
                        )
                        
                    )
                                    
                await Promise.all(toSend.splice(0))
   
                //!DEBUG DATA DELETE
                console.log('AB GET ',alreadyExportedBufs)
                
                alreadyExportedBufs.push(...bundle[topics[i]])
                
                console.log('AB post ',alreadyExportedBufs)
                
                console.log('SNAP ',SNAPSHOT[`EXPORT_ANY_NEWS`].SEND)
                    
            }    

        }

//        console.log('TOTAL IN ALREADY SEND -> ',alreadySendBufs)
        
        //Send to each node choosen in configs.So we send object 'packet' like ---> {  topic1:[bufA,bufB,bufC],  topic2:[bufX,bufP],  ...  }
        if(sign){

            destinate.forEach(receiver=>
            
                SEND(receiver.domain+route,new MSG(receiver.id,packet,receiver.sid),msg=>


                    msg==='OK'
                    ?
                    LOG(`\x1b[30mEXPORT_NEWS\x1b[32;1m to \x1b[36;1m${receiver.domain}\x1b[32;1m was successful`,'S')
                    :
                    LOG(`\x1b[30mEXPORT_NEWS\x1b[31;1m to \x1b[36;1m${receiver.domain}\x1b[31;1m unsuccessful`,'F')//pulse report to messenger


                ).catch(e=>LOG(`\x1b[30mEXPORT_NEWS\x1b[31;1m to \x1b[36;1m${receiver.domain}\x1b[31;1m failed ${e}`,'F'))
                          
            )
 
        }
    
    }


    //,Function to store buffer time by time




CONFIG.CACHES.NEWS.TTL!=0
&&
setTimeout(()=>

    FLUSH_CACHE(cache,'NEWS','STOP_FLUSH_NEWS_CACHE','CLEARTIMEOUT_NEWS'),CONFIG.CACHES.NEWS.DELAY
    
)




//Retrieve categories for empire,otherwise default categories will be set up
CONFIG.EMPIRE.START
?
CONFIG.EMPIRE.TOPICS.forEach(topic=>NEWSBUF.e[topic]=[])
:
NEWSBUF.e={politics:[],sport:[],economy:[],tech:[],other:[],future:[],showbiz:[],society:[],nature:[]}




//And load caches if it's possible
let buf=[],areas=['a','e']

areas.forEach(area=>
    
    Object.keys(NEWSBUF[area]).forEach(
    
        category => buf.push(
            
            news[area][category].get('BUFFER').then(
                
                stored => {
                    
                    NEWSBUF[area][category] = JSON.parse(stored)

                    LOG(`Cache \x1b[36;1m[${area}] -> [${category}]\x1b[32;1m loaded (size:${NEWSBUF[area][category].length})`,'S')

                    cache.set(area+category+'C',stored)//to make available to see instantly
                
                }
                
            ).catch(e=>LOG(`Cache \x1b[36;1m[${area}] -> [${category}]\u001b[38;5;3m not found`,'W'))
            
        )
    
    )
            
)

await Promise.all(buf.splice(0))




//*********************** SET HANDLERS ON USEFUL SIGNALS ************************




let graceful=async()=>{
    
    console.log('\n')

    LOG('NewNews termination has been initiated.Keep waiting...','I')

    //Probably stop logs on this step
    LOG(fs.readFileSync(PATH_RESOLVE('/images/custom/termination.txt')).toString(),'W')    



    //0.Commit snapshot to have latest one
    await dezCA.put('SNAPSHOT',SNAPSHOT).then(()=>LOG(`Snapshot stored`,'S')).catch(e=>LOG(`Snapshot not stored ${e}`,'W'))

    

    //The same with no-fulfilled buffers
    let buf=[],areas=['a','e']

    areas.forEach(area=>
        
        Object.keys(NEWSBUF[area]).forEach(
        
            category => buf.push(
                
                news[area][category].put('BUFFER',JSON.stringify(NEWSBUF[area][category])).then(
                    
                    () => LOG(`Cache \x1b[36;1m[${area}] -> [${category}]\x1b[32;1m stored (size:${NEWSBUF[area][category].length})`,'S')
                    
                ).catch(e=>LOG(`Cache \x1b[36;1m[${area}] -> [${category}]\u001b[38;5;3m not stored ${e}`,'W'))
                
            )
        
        )
                
    )
    
    await Promise.all(buf.splice(0))

    console.log('\n')

    LOG('Node was gracefully stopped','I')
        
    process.exit(0)

}



//Define listeners to safely stop the node
process.on('SIGTERM',graceful)
process.on('SIGINT',graceful)
process.on('SIGHUP',graceful)


//************************ END SUB ************************



































export let N={




    //Shell for previous function for dynamic time correlation
    EXPORT_NEWS_START:async(type,newsDB,route)=>{
        
        LOG(`\x1b[42m\x1b[33;1mEXPORT_${type}_NEWS\x1b[0m\x1b[36;1m just started`,'I')

        let configs=CONFIG[`EXPORT_${type}_NEWS`],//type ∈ { EMP , ANY } 
    
            prop=`STOP_EXPORT_${type}_NEWS`
        
        await EXPORT_NEWS(configs.TOPICS,SNAPSHOT[`${type}_TOPICS_CONTROL`],SNAPSHOT[`EXPORT_${type}_NEWS`].SEND,configs.MAX_BUFS_PER_TOPIC,newsDB,configs.SCOPE,route)

        //Start new cycle
        global[prop]=setTimeout(()=>N.EXPORT_NEWS_START(type,newsDB,route),configs.PERIOD)
    
        //If we need to stop export processes
        !CONFIG.TRIGGERS[`EXPORT_${type}_NEWS`]&&clearTimeout(global[prop])
           
    },




//_____________________________________________________________NEWSSHARING_______________________________________________________________________




    anyNews:a=>ACCEPT_NEWS(a,'a'),




    empNews:a=>ACCEPT_NEWS(a,'e',PRIVIL),




    /*  Received list is an array of news(type of object as in previous routes)
        News must be related to one topic
        b.d[0]-topic b.d[1]-array of news
    */
    anyNewsList:a=>ACCEPT_NEWS_LIST(a,'a'),




    empNewsList:a=>ACCEPT_NEWS_LIST(a,'e'),



    
    //To set the source as the source of all news in array.Will mostly used by CDN-similar services
    //0-type(a or e) 1-topic 2-id of newsgroup 3-reference
    setOneSrc:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
    
        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
        if(!body.d){
            
            !a.aborted&&a.end('No data')
            
            return
        
        }
        
        let [type,topic,bufId] = body.d,
        
            ref=type==='a'?'ANY':'EMP'
        
        
        if(CONFIG.TRIGGERS.SET_ONE_SRC&&(type==='a'||type==='e')&&news[type][topic]&&await ACC_CONTROL(body.c,JSON.stringify(body.d),body.f,1,PRIVIL)){
        
            news[type][topic].get(SNAPSHOT[ref+'_TOPICS_CONTROL'][topic][bufId]).then(v=>{
            
                v=JSON.parse(v)

                if(v.length<CONFIG[ref+'_NEWS_BUF_LEN']+CONFIG.MAX_SET_ONE_SRC){
            
                    v.push(body.d[3])
                
                    news[type][topic].put(SNAPSHOT[ref+'_TOPICS_CONTROL'][topic][bufId],JSON.stringify(v)).then(()=>cache.set(type+topic+bufId))
                    
                    !a.aborted&&a.end('OK')
                
                }else !a.aborted&&a.end('Too many sources')

            }).catch(e=>!a.aborted&&a.end('DB error'))
            
        }else !a.aborted&&a.end('Overview failed')

    }),

    


    //Сюда присылать MSG вида {c:'2dsafsd',d:'адрес пригласившего',f:'finalHash созданный SIDом пригласившего'}
    entryNewbies:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
            
        let body=await BODY(v,CONFIG.MAX_PAYLOAD_SIZE)

        if(CONFIG.TRIGGERS.ENTRY_NEWBIES&&typeof body.c==='string'&&typeof body.d==='string'&&typeof body.f==='string'&&CONFIG.ENTRY_NEWBIES!=='3'){

            let member=await ACCOUNTS.get(body.d),
            
                newb=await ACCOUNTS.get(body.c)


            if(!newb.R.includes('E')&&HMAC(body.c,member.S,'',body.f)&&(CONFIG.ENTRY_NEWBIE==='1'||CONFIG.ENTRY_NEWBIES==='2'&&INV2.test(member.R))){
                
                newb.R+='E'//add newbie to empire

                ACCOUNTS.set(body.c,newb)

                !a.aborted&&a.end('OK')
            
            }else !a.aborted&&a.end('Inner verification failed')
        
        }else !a.aborted&&a.end('Outer verification failed')
        
    }),



//_______________________________________________________________GET NEWS________________________________________________________________________




    getAnyNews:(a,q)=>GET_NEWS(a,'a',q.getParameter(0),q.getParameter(1)),

    getEmpNews:(a,q)=>GET_NEWS(a,'e',q.getParameter(0),q.getParameter(1)),




//____________________________________________________________IMPORT SECTION_____________________________________________________________________




    importAnyNews:a=>IMPORT_NEWS(a,'a'),
 
    
    importEmpireNews:a=>IMPORT_NEWS(a,'e')
    
}