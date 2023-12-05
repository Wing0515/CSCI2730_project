const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("CUHKon", () => {
  let cuhkon;
  let deployer, buyer

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();

    const CUHKon = await ethers.getContractFactory("CUHKon");
    cuhkon = await CUHKon.deploy();
  });

  describe("Deployment", () => {
    it("Set the owner", async () => {
      expect(await cuhkon.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await cuhkon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait();
    });

    it("Returns item attributes", async () => {
      const item = await cuhkon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Emits List event", () => {
      expect(transaction).to.emit(cuhkon, "List");
    });

    it("Owner Only", async () => {
      await expect(
        cuhkon.connect(buyer).list(
          1,
          NAME,
          CATEGORY,
          IMAGE,
          COST,
          RATING,
          STOCK
        )
      ).to.be.reverted;
    });
  });
  
  describe("Buying", () => {
    let transaction;
    
    beforeEach(async () => {
      transaction = await cuhkon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      
      await transaction.wait();

      transaction = await cuhkon.connect(buyer).buy(
        ID,
        { value: COST }
      );

      await transaction.wait();
    });

    
    it("Updates buyer's order count", async () => {
      const result = await cuhkon.orderCount(buyer.address);
      expect(result).to.equal(1);
    })
    
    it("Adds the order", async () => {
      const order = await cuhkon.orders(buyer.address, 1);
      
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });
    
    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(cuhkon.address);
      expect(result).to.equal(COST);
    });

    it("Emits Buy event", () => {
      expect(transaction).to.emit(cuhkon, "Buy");
    });

  });


  describe('Withdrawing', () => {
    let balanceBefore;

    beforeEach(async () => {
      //List the item
      let transaction = await cuhkon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait();

      //Buy a item
      transaction = await cuhkon.connect(buyer).buy(
        ID,
        { value: COST }
      );

      await transaction.wait();

      //Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      //Withdraw
      transaction = await cuhkon.connect(deployer).withdraw();
      await transaction.wait()
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(cuhkon.address);
      expect(result).to.equal(0);
    });
  });

})
