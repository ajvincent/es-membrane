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

  getOwner = () => this.#owner;
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("arrow function to target", Fred, [hisBike.getOwner], true);
