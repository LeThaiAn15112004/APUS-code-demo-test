// Sử dụng hàm readFile mà bạn đã định nghĩa trong preload
try {
    const path = 'C:/Users/ADMIN/Documents/GitHub/APUS-code-demo-test/web-filter-security-lab/package.json';

    // Gọi thông qua window.api
    const content = window.api.readFile(path);

    console.log('Nội dung file là:', content);
} catch (error) {
    console.error('Lỗi khi đọc file:', error);
}