class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;

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

// no need for subclass tests: private fields live with the instance directly
