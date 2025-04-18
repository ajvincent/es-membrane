import "es-search-references/guest";

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new Map<Vehicle, Person>;

class Vehicle {
  static get #owners(): WeakMap<Vehicle, Person> {
    return vehicleToOwnerMap;
  }

  constructor(owner: Person) {
    Vehicle.#owners.set(this, owner);
  }
}

const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
void(hisCar);

searchReferences("class static getters", Fred, [Vehicle], true);
