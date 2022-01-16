import {ACC_CONTROL,BODY,LOG,PRIVIL,SEND} from '../NN_Space/utils.js'

import {getData,importData,FLUSH_CACHE} from './store.js'

import {branchcom,exchangeB,store} from '../nn.js'

import CACHE from '../NN_Essences/primitivecache.js'

import MSG from '../NN_Essences/msg.js'




//______________________________________________________FUNCTIONS & VARIABLES POOL_______________________________________________________________


let PUSH_BRANCHCOMS_CONTROL=hash=>
    
    BRANCHCOMS_CONTROL.length<CONFIG.EXPORT_BRANCHCOMS.BUF_MAX_LEN
    ?
    BRANCHCOMS_CONTROL.push(hash)
    :
    exchangeB.put(BRANCHCOMS_CONTROL[0],BRANCHCOMS_CONTROL.splice(0,BRANCHCOMS_CONTROL.length,hash)).catch(e=>''),



    
cache=new CACHE(CONFIG.CACHES.BRANCHCOMS.SIZE),




EXPORT_RESOURCES=async(control,scope,hashDB,srcDB,route)=>{

    //scope-EXPORT_BRANCHCOMS,EXPORT_STORE -----AND----- route-ibc,is


    LOG(`\x1b[42m\x1b[33;1m${scope}\x1b[0m\x1b[36;1m just started`,'I')
    
    let hashes=control.splice(0,CONFIG[scope].MAX_TO_SEND),packet={},toSend=[],

        //if limit!==0 we don't fullfilled packet to MAX_STORE_TO_SEND,so we can fetch additional data from 'exchange'
        more=CONFIG[scope].MAX_TO_SEND-hashes.length,
    
        limit=( more-more%CONFIG[scope].BUF_MAX_LEN )  /  CONFIG[scope].BUF_MAX_LEN
    




    if(limit!==0){

        let sign//signal that we have data to send
    
        hashDB.createReadStream({limit}).on('data',hashArr=>{

            sign=true

            hashArr.value.forEach(dataHash=>
            
                toSend.push(
                    
                    srcDB.get(dataHash).then(data=>
                        
                        packet[dataHash]=data
                    
                    ).catch(e=>'')
                    
                )
                
            )
        
        }).on('close',async()=>{

            if(sign||hashes.length!==0){


                await Promise.all(toSend.splice(0))
        

                CONFIG[scope].SCOPE.forEach(node=>
                
                    SEND(node.domain+route,new MSG(node.id,packet,node.sid),msg=>{

                        if(msg==='1'){

                            LOG(`\x1b[30m${scope} \x1b[32;1mto \x1b[36;1m${node.domain}\x1b[32;1m successful`,'S')


                            Object.keys(packet).forEach(exportHash=>hashDB.del(exportHash).catch(e=>''))


                        }else LOG(`${scope} to ${node.domain} failed with message \x1b[36;1m${msg}`,'W')

                    
                    }).catch(e=>LOG(`${scope} to ${node.domain} failed with message \x1b[36;1m${e}`,'W'))
                    
                )

            }
        
        })
    
    }else{
        
        hashes.forEach(hash=>
            
            toSend.push(srcDB.get(hash).then(v=>packet[hash]=v).catch(e=>''))
            
        )

        await Promise.all(toSend.splice(0))
        
        console.log(packet)

        CONFIG[scope].SCOPE.forEach(destinate=>
        
            SEND(destinate.domain+route,new MSG(destinate.id,packet,destinate.sid),msg=>
        
                msg==='1'
                ?
                LOG(`\x1b[30m${scope} \x1b[36;1mto ${destinate.domain}\x1b[32;1m successful`,'S')
                :
                LOG(`${scope} to ${destinate.domain} failed with message \x1b[36;1m${msg}`,'W')//pulse message to messenger
    
            ).catch(e=>LOG(`${scope} to ${destinate.domain} failed with message \x1b[36;1m${e}`,'W'))
    
        )
    
    }

}




//_____________________________________________________________START TIMERS______________________________________________________________________




//...to flush cache every <TYPE.TTL> milliseconds.There is ability to stop this process or not execute if TTL=0
CONFIG.CACHES.BRANCHCOMS.TTL!=0 && setTimeout(()=>FLUSH_CACHE(cache,'BRANCHCOMS','STOP_FLUSH_BRANCHCOMS_CACHE','CLEARTIMEOUT_BRANCHCOMS'),CONFIG.CACHES.BRANCHCOMS.DELAY)








export let B={


//__________________________________________________________EXPORT SECTION___________________________________________________________________
    
    


    EXPORT_RESOURCES_START:async(control,scope,hashDB,srcDB,route,stopExport)=>{
    
        //global.BRANCHCOMS_CONTROL||=[]-buffer of hashes for futher export.Here we push hashes which are the keys of store DB
        await EXPORT_RESOURCES(control,scope,hashDB,srcDB,route)
    
        global[stopExport]=setTimeout(()=>B.EXPORT_RESOURCES_START(control,scope,hashDB,srcDB,route,stopExport),CONFIG[scope].PERIOD)
     
        !CONFIG.TRIGGERS[scope] && clearTimeout(global[stopExport])
    
    },




//______________________________________________________________ROUTES_______________________________________________________________________




    getBranchcom:(a,q)=>getData(a,q,CONFIG.TRIGGERS.GET_BRANCHCOMS,CONFIG.TTL.BRANCHES,cache,branchcom),


    

    openBc:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
        
        //If trigger is off or maximum branches currently
        if(CONFIG.BC_PERM===SNAPSHOT.BCQ||!CONFIG.TRIGGERS.OPEN_BC){
            
            !a.aborted&&a.end('Route is off or no more space')
            
            return
        
        }


        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
        if(typeof b.c==='string'&&typeof b.d==='string'&&b.d.length===64&&typeof b.f==='string'){
            
            ACC_CONTROL(b.c,b.d,b.f,1,0,1).then(acc=>{
                
                if(acc){

                    branchcom.get(b.d).then(v=>!a.aborted&&a.end('Exists')).catch(e=>{
                        
                        if(e.notFound){
                        
                            //Privil addresses has ability to open branch of comments to any news they want.Default addresses may open branches only to existed fullnews on this node
                    
                            if(PRIVIL.test(acc.R)) branchcom.put(b.d,JSON.stringify([])).then(()=>(!a.aborted&&a.end('OK'),SNAPSHOT.BCQ++)).catch(e=>!a.aborted&&a.end('DB error'))
                    
                            else store.get(b.d).then(v=>
                                
                                    v[0]==='{'//means that it's fullnews
                                    ?
                                    branchcom.put(b.d,JSON.stringify([])).then(()=>(!a.aborted&&a.end('OK'),SNAPSHOT.BCQ++))
                                    :
                                    !a.aborted&&a.end('No such fullnews on this chain')
        
                                ).catch(e=>!a.aborted&&a.end('DB error'))

    
                            //Тут такая проверка,чтоб BRANCHCOMS_CONTROL был размером как BUF_MAX_LEN чтоб дальше не было проблем с размером буфера
                            //Check length not to overflow buffer of control
            
                            CONFIG.EXPORT_BRANCHCOMS.HANDLE_EVEN_IF_STOP&&PUSH_BRANCHCOMS_CONTROL(b.d)
                    
                        }else !a.aborted&&a.end('DB error')    
                        
                    })

                }else !a.aborted&&a.end('No such acc')
            
            })
        
        }else !a.aborted&&a.end('Wrong datatypes')

    }),
    
    
    
    //{d:['newsID(hash)',comment_object],f:fullhash}
    //hash of сomment must be signed!
    //Mb one comment by one address per news
    comment:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
        
        if(!CONFIG.TRIGGERS.COMMENT_BC){
            
            !a.aborted&&a.end('Route is off')
            
            return
        
        }

        let b=await BODY(v,CONFIG.PAYLOAD_SIZE),allow


        allow=

        //Check types and validate account
        typeof b.f==='string'&&typeof b.d?.[0]==='string'&&b.d[0].length===64
        &&
        typeof b.d[1]?.c==='string'&&typeof b.d[1].t==='string'&&b.d[1].t.length<=CONFIG.COMMENT_LEN
        &&
        typeof b.d[1].s==='string'&&await ACC_CONTROL(b.d[1].c,b.d[1].t+b.d[1].s,b.f,1)



        if(allow){

            branchcom.get(b.d[0]).then(bc=>{

                bc=JSON.parse(bc)

                if(CONFIG.BCL>bc.length){
                
                    bc.push({
                        
                        c:b.d[1].c,
                        
                        t:b.d[1].t,
                        
                        s:b.d[1].s
                    
                    })
                    
                    branchcom.put(b.d[0],JSON.stringify(bc))
                    
                        .then(()=>
                        
                            !a.aborted && a.end('OK')
                            
                        ).catch(e=>
                            
                            !a.aborted && a.end('DB error')
                            
                        )
    
                }else !a.aborted && a.end('Too many comments.Try another node or check from cluster(via /i)')
    
            }).catch(e=>!a.aborted && a.end('DB error'))

        }else !a.aborted && a.end('Wrong types')

    }),




//____________________________________________________________IMPORT SECTION_____________________________________________________________________    

    importBranchcoms:a=>importData(a,'BRANCHCOMS',branchcom)

}