import "es-search-references/guest";

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  #owner: Person;

  constructor(owner: Person) {
    this.#owner = owner;
    void(this.#owner);
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class private fields", Fred, [hisBike], true);

// no need for subclass tests: private fields live with the instance directly
