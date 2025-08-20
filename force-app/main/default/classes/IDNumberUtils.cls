public class IDNumberUtils {

    public static void AddIDNumber (String IDNumber, String birthdate, String gender, Boolean citizen) {
        ID_Number_Reference_Count__c[] recs = [
            select ID_Number__c, Date_of_Birth__c, Gender__c, SA_Citizen__c, NumReferences__c
            from ID_Number_Reference_Count__c
            where ID_Number__c = :IDNumber
            ];
        
        if (recs.isEmpty()) {
            String[] dateParts = birthdate.split('-');
            Date DoB = Date.newInstance (Integer.valueOf(dateParts[0]), Integer.valueOf(dateParts[1]), Integer.valueOf(dateParts[2]));
            ID_Number_Reference_Count__c NewRec = new ID_Number_Reference_Count__c (
                ID_Number__c = IDNumber, Date_of_Birth__c = DoB, Gender__c = gender, SA_Citizen__c = citizen, NumReferences__c = 1
            );
            insert NewRec;
        } else {
            recs[0].NumReferences__c = recs[0].NumReferences__c+1;
            update recs;
        }
    }
}