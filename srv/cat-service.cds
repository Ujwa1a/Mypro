using my.otrequests as my from '../db/data-model';

service CatalogService {

     entity PersonalData as projection on my.PersonalData;
     
     entity OvertimeRequest as projection on my.OvertimeRequest;
}
