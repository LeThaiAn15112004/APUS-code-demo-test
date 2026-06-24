export default class Student {
    constructor(
        id,
        student_code,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        major,
        class_name,
        status,
        created_at,
        updated_at
    ) {
        this.id = id;
        this.student_code = student_code;
        this.full_name = full_name;
        this.email = email;
        this.phone = phone;
        this.date_of_birth = date_of_birth;
        this.gender = gender;
        this.address = address;
        this.major = major;
        this.class_name = class_name;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}