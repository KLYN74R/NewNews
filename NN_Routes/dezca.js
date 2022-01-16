import {ACC_CONTROL,BODY} from '../NN_Space/utils.js'

import Prfproofs from '../NN_Essences/prfproofs.js'

import {dezCA} from '../nn.js'




//______________________________________________________________LOCAL_DezCA______________________________________________________________________




export let D={
    

    //Allow user to send unrproofed data anout his person.This data just stores here and might be approved by another big DezCA or approved by this nodeowner
    dezCA:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
        //1-updated signature
        if(b.d?.[0]?.length<=CONFIG.PRF_ROLE_MAX_LEN&&b.d?.[1]?.length===86&&await ACC_CONTROL(b.c,b.d,b.f,1,1)){

            dezCA.get(b.c).then(v=>{
            
                //Logic
            
            }).catch(e=>e.notFound?dezCA.put(b.c,JSON.stringify(new Prfproofs(['S_'+b.d[0]],b.d[1])))&&a.end('OK'):a.end(''))
        
        }else a.end('')
        
    }),

    
    //User may delete info about himself if allowed
    dezCADelete:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        if(!CONFIG.SELF_DELETE){a.end(''); return}

        let b=await BODY(v, CONFIG.PAYLOAD_SIZE)
        
        await ACC_CONTROL(b.c,b.d,b.f,1,1)
        ?
        dezCA.get(b.c).then(v=>{
            
            v=JSON.parse(v)
            
            v.p.includes(b.d?.[0])&&v.p.splice(v.p.indexOf(b.d[0]),1)
        
        })
        :
        a.end('')
    
    }),

 
    dezCAApprove:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let b=await BODY(v, CONFIG.PAYLOAD_SIZE)
        
        await ACC_CONTROL(b.c,b.d,b.f,1,1)
        ?
        dezCA.get(b.c).then(v=>{

            //Prefix "S_" to know which roles we should paste to SIG function to check the signature
    
            if(v.p.includes(b.d[0])){
            
                v=JSON.parse(v)

                v.p.push(`S_${b.d[0]}`)
               
                v.s=b.d[1]//updated signature which includes new role in addition
                   
                dezCA.put(b.c,JSON.stringify(v))
                
                a.end('OK')

            }
            else a.end('')
            
        }).catch(e=>e.notFound?dezCA.put(b.c,JSON.stringify(new Prfproofs([`S_${b.d[0]}`],b.d[1])))&&a.end('OK'):a.end(''))
        :
        a.end('')

    }),




    approveExternalAcc:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
    }),
}