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
  }

  get owner(): Person {
    return vehicleToOwnerMap.get(this)!;
  }
}

const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);

// `hisCar.owner === Fred`
searchReferences("reaching a value via a getter", Fred, [hisCar], true);

class Bicycle {
  constructor(rider: Person) {
    vehicleToOwnerMap.set(this, rider);
  }

  set rider(newRider: Person) {
    vehicleToOwnerMap.set(this, newRider);
  }
}
const Wilma = new Person("Wilma")
const herBike = new Bicycle(Wilma);

// this should come back null:  there's no way to get a rider from herBike.
searchReferences("unreachable values with only a setter route", Wilma, [herBike], true);
