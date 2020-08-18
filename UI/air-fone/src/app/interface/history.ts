export class History
{
    public billing_id:string;
    public MobileNo:string;
    public Benefits:string;
    public price:string;
    public start:string;
    public end:string;
    constructor(billing_id:string,MobileNo:string,Benefits:string,price:string,start:string,end:string)
    {
        this.billing_id=billing_id;
        this.MobileNo=MobileNo;
        this.Benefits=Benefits;
        this.price=price;
        this.start=start;
        this.end=end;
    }
}