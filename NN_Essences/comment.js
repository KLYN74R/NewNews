import {SIG} from '../NN_Space/utils.js'

export default class{

    constructor(sendr,text,newsHash,prv){
    
        this.c=sendr
    
        this.t=text
    
        this.s=SIG(newsHash+text,prv)
    
    }

}