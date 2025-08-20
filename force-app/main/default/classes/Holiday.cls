public class Holiday {
    String name;
    String isoDate;
    String description;
    String primaryType;
    String urlID;
    
    public Holiday (Object H) {
        Map<String, Object> H2 = (Map<String, Object>) H;
        this.name = (String) H2.get('name');
        this.description = (String) H2.get('description');
        this.isoDate = (String) ((Map <String, Object>) H2.get('date')).get('iso');
        this.primaryType = (String) H2.get('primary_type');
        this.urlID = (String) H2.get('urlid');
    }
    
    public Map<String, String> toMap() {
        return new Map<String, String> {
            'name' => this.name,
            'isoDate' => this.isoDate,
            'description' => this.description,
            'primaryType' => this.primaryType,
            'urlID' => this.urlID
        };
  }
    
    public override String toString () {
        return name + ', ' + description + ', ' + isoDate + ', ' + primaryType;
    }
}