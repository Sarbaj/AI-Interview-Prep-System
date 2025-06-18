import { connect } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const DbConnection=async()=>{

    try {
        const Conn=await connect(process.env.MONGO_URI)
        if (Conn) {
            console.log(`✅ Database Connected: ${Conn.connection.host}`);
        }
        
    } catch (error) {   
        console.error('error on connection');
    }

}
export default DbConnection;