public class Holiday {
    String name;
    String isoDate;
    String description;
    String primaryType;
    
    public Holiday (Object H) {
        Map<String, Object> H2 = (Map<String, Object>) H;
        this.name = (String) H2.get('name');
	    this.description = (String) H2.get('description');
    	this.isoDate = (String) ((Map <String, Object>) H2.get('date')).get('iso');
        this.primaryType = (String) H2.get('primary_type');
    }
    
    public override String toString () {
        return name + ', ' + description + ', ' + isoDate + ', ' + primaryType;
    }
}