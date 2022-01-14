import{BASE64,VERIFY,ENCRYPT,BODY,GET_CHAIN_ACC} from '../NN_Space/utils.js'

import {space} from '../nn.js'

import c from 'crypto'




export let M={




//________________________________________________________________SPACE__________________________________________________________________________








    //[0,1,2] -> 0-RSA pubkey 1-signature 2-chain(controllerAddr)
    startSpaceId:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
        
        let b=await BODY(v,CONFIG.EXTENDED_PAYLOAD_SIZE),

        //_________________________________Let's check permission for initial SpaceID generation_________________________________

        allow=
        
        //Check lightweight instant predicates
        typeof b.c==='string'&&typeof b.d?.[0]==='string'&&typeof b.d[1]==='string'&&typeof b.d[2]==='string'&&CONFIG.TRIGGERS.START_SPACE_ID
        
        &&//Also lightweight but account can be read from db,not from cache,so it might be promise.Check if address is on some chain(or entry is free) and address still don't have SID...etc
        
        (CONFIG.START_SID_EVERYONE || await GET_CHAIN_ACC(b.c,b.d[2])) && !(ACCOUNTS.cache.has(b.c) || await ACCOUNTS.db.get(b.c).catch(e=>false))
        
        &&//...Check signature(SIG(RSApub+GUID)) to allow user to create account in <space>
        await VERIFY(b.d[0]+GUID,b.d[1],b.c)




        if(allow){

            //Create one hidden class and set default vals
            let acc={S:'',R:CONFIG.DEFAULT_ROLES,N:1}//Note:Due to  <N % by CONFIG.DEBOUNCE_MODULUS> start with 1,not 0,for instant start

            c.randomBytes(64,(e,r)=>{
                
                if(!e){
                    
                    acc.S=BASE64(r)//64 byte entropy SpaceId(SID) for communications Address(you) <-> Node
                    
                    //acc.TIME=new Date().getTime()

                    //ACCOUNTS.set(b.c,acc)

                    space.put(b.c,acc).catch(e=>'')

                    !a.aborted&&a.end(ENCRYPT(acc.S,b.d[0]))
    
                }else !a.aborted&&a.end('Bytes generation failed')
            
            })

        }else !a.aborted&&a.end('Verification failed')
                
    }),

    


    //TODO:Мб всё таки вернуть задержку во времени в рамках NewNetworks
    //0-RSA pubkey 1-signature
    spaceChange:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true).onData(async v=>{
        
        let b=await BODY(v,CONFIG.EXTENDED_PAYLOAD_SIZE)

        ACCOUNTS.get(b.c).then(async acc=>{
            
            if(acc&&await VERIFY(b.d[0]+GUID,b.d[1],b.c)){
                
                c.randomBytes(64,(e,r)=>{
                
                    if(!e){
                        
                        acc.S=BASE64(r)
                        
                        //acc.TIME=new Date().getTime()
    
                        ACCOUNTS.set(b.c,acc)
    
                        !a.aborted&&a.end(ENCRYPT(acc.S,b.d[0]))


                        //For future upgrading of Space protocol
                        //!Cloud heartbeat
                        // if(CONFIG.INFORM_WHEN_SPACE_CHANGE){
                
                        //     let alertThem=Object.values(CONFIG.CHANGE_PROCEDURE)

                        //     for(let i=0,l=alertThem.length;i<l;i++) SEND(alertThem[i].domain+'/csp',new MSG(b.c,alertThem[i].sid,'0'))
                    
                        // }
        
                    }else !a.aborted&&a.end('Bytes generation error')
                
                })

            }else !a.aborted&&a.end('Verification failed')
        
        }).catch(e=>!a.aborted&&a.end('No such acc or DB error'))
        
    }),

}