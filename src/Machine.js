export class Machine {
    constructor(id, vin, name, make, type, model, lastKnown,locationHistory) {
        this.id = id;
        this.vin = vin;
        this.name = name;
        this.make = make;
        this.type = type;
        this.model = model;
        this.lastKnown = lastKnown;
        this.locationHistory = locationHistory
    }
}