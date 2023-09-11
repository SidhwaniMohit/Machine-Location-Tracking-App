export class Machine {
    constructor(id, vin, name, make, type, model, lastKnown,locationHistory, lastUpdatedTime, locationAddress) {
        this.id = id;
        this.vin = vin;
        this.name = name;
        this.make = make;
        this.type = type;
        this.model = model;
        this.lastKnown = lastKnown;
        this.locationHistory = locationHistory;
        this.lastUpdatedTime = lastUpdatedTime;
        this.locationAddress = locationAddress;
    }
}