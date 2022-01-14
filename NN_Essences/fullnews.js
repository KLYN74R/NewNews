import {SIG} from '../NN_Space/utils.js'

export default class{

    constructor(sender,inp,ref,prv){

        this.c=sender

        this.i=inp

        this.r=ref

        this.s=SIG(inp+ref,prv)

    }

}