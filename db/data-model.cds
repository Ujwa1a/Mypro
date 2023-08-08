namespace my.otrequests;

entity PersonalData {
  key employeeId          : String(20)not null;
      employeeName        : String(20);
      designation         : String(20);
      mailId              : String(30);
      department          : String(20);
      immediateSupervisor : String(20);
      hourleyPayRate      : Integer not null;
linkOvertimeRequest  : Association to many OvertimeRequest on linkOvertimeRequest.linkEmployee = $self;
}

entity OvertimeRequest {
  key RequestId            : String(20);
      OvertimeStartDate    : Date;
      OvertimeEndDate      : Date;
      DateRequestSubmitted : Date;
      OvertimeReason       : String(100)not null;
      TotalOvertimeHours   : Integer;
      linkEmployee          : Association to PersonalData;
}
