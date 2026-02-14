
import Link from "next/link";

export default function ClientDashBoard() {
  return (
    <div className="container">
      <div className="dashboard">
      <h1 className="title">Mar's Auto Repair Shop</h1>
      <div className="grid">

        <Link href="/request_service">
          <button className="btn">Request Service</button>
        </Link>

        <Link href="/talk_to_us">
          <button className="btn">Talk to Us</button>
        </Link>

       <Link href="/check_request_status">
          <button className="btn">Check Request Status</button>
        </Link>

        <Link href="/ratings">
          <button className="btn">Ratings</button>
        </Link>

      </div>

      
    </div>
    </div>
  );
}
