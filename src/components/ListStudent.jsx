import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ListStudent(){
    const [students, setStudents] = useState([]);

    useEffect(() => {
        async function fetchStudents(){
            const snapshot = await getDocs(collection(db, "students"));
            
            const studentData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setStudents(studentData);
        }

        fetchStudents();
    }, []);

    return (
        <div>
            <h2>Student List</h2>
            {students.map(student => (
                <div key={student.id}>
                    <p><strong>ID:</strong> {student.sid}</p>
                    <p><strong>Name:</strong> {student.student_name}</p>
                    <p><strong>Major:</strong> {student.major}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}