import { Sequelize } from "sequelize";

const connectDB = async () => {
  try {
    const sequelize = new Sequelize(process.env.POSTGRES_URI, {
      dialect: "postgres", // you can also use 'mysql' | 'sqlite' | 'mariadb'
      logging: false, // set true if you want SQL logs in console
    });

    await sequelize.authenticate();
    console.log("PostgreSQL Connected ✅");

    return sequelize; // return instance for models
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error);
    process.exit(1);
  }
};

export default connectDB;
