public class CalendarificCallout {
    
    public static List<Holiday> GetHolidays (String country, Integer year, Integer month, Integer day) {
        
        String url = 'callout:Calendarific/api/v2/holidays';
        String apiKey = '24c5e86734eb44dc4a962826324a5546e74dc42f';
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
        
        Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        
        Holiday[] holidayList = new List<Holiday>();
        Object[] holidaysContainer = (Object[])((Map<String, Object>)results?.get('response'))?.get('holidays');
        
        for (Object H : holidaysContainer) {
            holidayList.add (new Holiday (H));
        }
        return holidayList;
    }
    
}