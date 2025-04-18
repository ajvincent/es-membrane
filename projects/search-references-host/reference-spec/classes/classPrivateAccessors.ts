import "es-search-references/guest";

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new WeakMap<Vehicle | Bicycle, Person>;

class Vehicle {
  constructor(owner: Person) {
    vehicleToOwnerMap.set(this, owner);
    void(this.#owner);
  }

  get #owner(): Person {
    return vehicleToOwnerMap.get(this)!;
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class private getter", Fred, [hisBike], true);

class Bicycle {
  constructor(rider: Person) {
    this.#rider = rider;
  }

  set #rider(newRider: Person) {
    vehicleToOwnerMap.set(this, newRider);
  }
}
const Wilma = new Person("Wilma")
const herBike = new Bicycle(Wilma);

// this should come back null:  there's no way to get a rider from herBike.
searchReferences("unreachable values with only a setter route", Wilma, [herBike], true);

// no need for subclass tests: private fields live with the instance directly
