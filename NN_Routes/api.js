import {WRAP_RESPONSE} from '../nn.js'








export let A={


    local:async(a,q)=>{

        a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>a.aborted=true)
    
        let localNonce=(await ACCOUNTS.get(Buffer.from(q.getParameter(0),'hex').toString('base64'))).N+''
        
        !a.aborted&&a.end(localNonce)
        
    },




    info:a=>WRAP_RESPONSE(a,CONFIG.TTL.INFO).end(INFO)


}