🏘️ Society Connect - Residential Management Platform
Society Connect is a high-performance full-stack application designed to modernize housing society operations. It prioritizes transparent communication through a robust complaint-tracking system and interactive community grouping features.

🚀 Key Highlights
⚠️ Specialized Complaint Management
The complaint system is engineered for maximum accountability:

Media-Rich Reporting: Residents can upload high-resolution photos of maintenance issues directly from the interface.

Live Status Tracking: Each complaint follows a clear lifecycle: Submitted → In Review → Resolved.

Resolution Accountability: Residents receive immediate feedback as the status changes, ensuring management stays responsive.

👥 Interactive Grouping & Chat System
A dedicated space for community sub-groups (e.g., "Wing A", "Gardening Club"):

Visible Membership: The sidebar of every group displays a real-time list of member names, ensuring residents know their neighbors.

Transparent History: A persistent Group Chat where all historical messages are visible to members, facilitating seamless handovers and context.

Seamless Interaction: Built for rapid community updates, security alerts, and social coordination.

💎 Full System Specialities
🔐 Advanced Authentication (Login & Register)
Secure Gateway: A professionally centered authentication portal utilizing JWT (JSON Web Tokens) for secure, session-based access.

Encrypted Storage: Uses Bcrypt for one-way password hashing, ensuring resident data remains protected even at the database level.

Role-Based Entry: The system automatically detects during login whether the user is a Resident or an Administrator, redirecting them to their specific dashboard.

🛡️ Admin Super-Dashboard (The Command Center)
The Admin Dashboard is a specialized suite that gives society management total control over the environment:

Centralized Oversight: A "God-view" of all society activity, including every posted announcement and community group.

The Approval Engine: Admins have the exclusive power to Approve, Reject, or Delete complaints and posts to maintain society standards.

Member Management: Capability to view and moderate the user list, ensuring only verified residents have access to sensitive group chats.

Announcement Control: A dedicated broadcast tool to push society-wide alerts that appear instantly on all resident dashboards.

🛠️ Technical Architecture
Frontend: React.js with Vite for ultra-fast rendering.

Layout: Custom Flexbox/Grid CSS ensuring a perfect centered "Main Content" area with a fixed, professional sidebar.

Backend: Node.js & Express handling complex relational queries.

Database: PostgreSQL managing the complex relationships between Users, Groups, and Complaint tickets.
