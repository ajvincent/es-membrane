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
  }

  get owner(): Person {
    return this.#owner;
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class extending other classes", Fred, [hisBike], true);
