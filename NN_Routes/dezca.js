import {ACC_CONTROL,BODY} from '../NN_Space/utils.js'

import Prfproofs from '../NN_Essences/prfproofs.js'

import {dezCA} from '../nn.js'




//______________________________________________________________LOCAL_DezCA______________________________________________________________________




export let D={
    

    //Allow user to send unrproofed data anout his person.This data just stores here and might be approved by another big DezCA or approved by this nodeowner
    dezCA:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)
        //1-updated signature
        if(body.d?.[0]?.length<=CONFIG.PRF_ROLE_MAX_LEN&&body.d?.[1]?.length===86&&await ACC_CONTROL(body.c,body.d,body.f,1,1)){

            dezCA.get(body.c).then(v=>{
            
                //Logic
            
            }).catch(e=>e.notFound?dezCA.put(body.c,JSON.stringify(new Prfproofs(['S_'+body.d[0]],body.d[1])))&&a.end('OK'):a.end(''))
        
        }else a.end('')
        
    }),

    
    //User may delete info about himself if allowed
    dezCADelete:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        if(!CONFIG.SELF_DELETE){a.end(''); return}

        let body=await BODY(v, CONFIG.PAYLOAD_SIZE)
        
        await ACC_CONTROL(body.c,body.d,body.f,1,1)
        ?
        dezCA.get(body.c).then(v=>{
            
            v=JSON.parse(v)
            
            v.p.includes(body.d?.[0])&&v.p.splice(v.p.indexOf(body.d[0]),1)
        
        })
        :
        a.end('')
    
    }),

 
    dezCAApprove:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let body=await BODY(v, CONFIG.PAYLOAD_SIZE)
        
        await ACC_CONTROL(body.c,body.d,body.f,1,1)
        ?
        dezCA.get(body.c).then(v=>{

            //Prefix "S_" to know which roles we should paste to SIG function to check the signature
    
            if(v.p.includes(body.d[0])){
            
                v=JSON.parse(v)

                v.p.push(`S_${body.d[0]}`)
               
                v.s=body.d[1]//updated signature which includes new role in addition
                   
                dezCA.put(body.c,JSON.stringify(v))
                
                a.end('OK')

            }
            else a.end('')
            
        }).catch(e=>e.notFound?dezCA.put(body.c,JSON.stringify(new Prfproofs([`S_${body.d[0]}`],body.d[1])))&&a.end('OK'):a.end(''))
        :
        a.end('')

    }),




    approveExternalAcc:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
    }),
}