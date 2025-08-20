public class CalendarificCallout {
    
    @AuraEnabled
    public static List<Map<String,String>> GetHolidays (String country, Integer year, Integer month, Integer day) {
        
        String url = 'callout:Calendarific/api/v2/holidays';
        String apiKey = [SELECT Key__c from APIKey__mdt where DeveloperName = 'Calendarific']?.Key__c;
        if (apiKey == null) throw new RESTException ('Couldn\'t find API Key for service: Calendarific');
        String endPoint = url + '?api_key=' + apiKey;
        
        String theCountry = country==null ? 'ZA' : country;
        endPoint += '&country=' + theCountry;
        
        Integer theYear = year < 1 ? Date.today().year() : year;
        endPoint += '&year=' + theYear;
        
        if (month > 0) {
            endPoint += '&month=' + month.toString();
        }
        
        if (day > 0) {
            endPoint += '&day=' + day.toString();
        }
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endPoint);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if (response.getStatusCode() != 200) {
            throw new RESTException ('Bad response from Calendarific server: ' + response.getBody());
        }
        Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        
        List<Map<String,String>> holidayList = new List<Map<String,String>>();
        
        Object[] holidaysContainer = (Object[])((Map<String, Object>)results?.get('response'))?.get('holidays');
        
        for (Object H : holidaysContainer) {
            holidayList.add (new Holiday (H).toMap());
        }
        return holidayList;
    }
    
    public class RESTException extends Exception{}
}