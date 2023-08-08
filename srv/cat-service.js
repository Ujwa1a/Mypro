const cds = require('@sap/cds');
const {OvertimeRequest,PersonalData} = cds.entities('my.otrequests');

module.exports = cds.service.impl(async function() {  
    
    this.before('CREATE','PersonalData', validateEmployeeCreate);

    this.on('READ','PersonalData', readEmployees); 

    this.on('UPDATE','PersonalData', validateEmployeeChanges); 

    this.before('DELETE','PersonalData', validateEmployeeDelete); 

   // this.on('READ','PersonalData', highPayRate);

});

const readEmployees = async (req,next) =>
{
    var entity = next();
    return entity;
}

const validateEmployeeDelete = async (req) => 
{
    var empId = req.data.employeeId;
    var leaveRequestList = await SELECT.from(OvertimeRequest).where({linkEmployee_employeeId:empId});
    console.log("Emp Leave req.", leaveRequestList);
    
    if(leaveRequestList.length>0)
    {
        return req.reject({code:"400",message:"Employee has Overtime Request Pending, Cannot be deleted"});
    }
    else
    req.info({code:"200", message: "Employee Deleted"}); 
}

const validateEmployeeCreate = async (req) => 
{
    if(req.data.employeeId.length>5)
    req.error({code:"400", message: "Invalid Employee Id, Cannot be more than 5 chars"}); 
    else
    req.info({code:"200", message: "New Employee Created"}); 
}
const validateEmployeeChanges = async (req) => 
{
    console.log("Request data from UI:",req.data);
    if(req.data.employeeName==="")    
    {
     return req.error(400,"Employee Name cannot be Empty");         
    }
    else
     req.info("Employee Changes Saved"); 
}
/*
const highPayRate = async (req, next) => 
{   
    const entity = await next();
    for (const entity of entry){
        if(entry.hourleyPayRate > 400){
            entry.employeeName += ' -(Star Employee)';
        }
    }
    return entity;
}
*/

    