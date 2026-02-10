// Data awal dispensasi (bisa dari database di aplikasi nyata)
let dispensations = JSON.parse(localStorage.getItem('dispensations')) || [];
let notificationTimeout;

// DOM Elements
const dispensationForm = document.getElementById('dispensationForm');
const studentNameInput = document.getElementById('studentName');
const studentClassSelect = document.getElementById('studentClass');
const reasonSelect = document.getElementById('reason');
const customReasonTextarea = document.getElementById('customReason');
const durationInput = document.getElementById('duration');
const timeUnitSelect = document.getElementById('timeUnit');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const totalCountElement = document.getElementById('totalCount');
const todayCountElement = document.getElementById('todayCount');
const notificationModal = document.getElementById('notificationModal');
const notificationMessage = document.getElementById('notificationMessage');
const closeModalButton = document.querySelector('.close-modal');
const confirmModalButton = document.querySelector('.btn-confirm');

// Format waktu
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Hitung jumlah dispensasi hari ini
function getTodayDispensationsCount() {
    const today = new Date().toDateString();
    return dispensations.filter(d => {
        const dispensationDate = new Date(d.timestamp).toDateString();
        return dispensationDate === today;
    }).length;
}

// Update statistik
function updateStats() {
    totalCountElement.textContent = dispensations.length;
    todayCountElement.textContent = getTodayDispensationsCount();
}

// Tampilkan atau sembunyikan tabel kosong
function toggleEmptyState() {
    if (dispensations.length === 0) {
        emptyState.style.display = 'flex';
        tableBody.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
    }
}

// Render tabel dispensasi
function renderTable() {
    tableBody.innerHTML = '';
    
    dispensations.forEach((dispensation, index) => {
        const row = document.createElement('tr');
        
        // Format waktu pengajuan
        const submissionDate = new Date(dispensation.timestamp);
        const formattedTime = `${formatDate(submissionDate)} ${formatTime(submissionDate)}`;
        
        // Gunakan alasan custom jika tersedia, jika tidak gunakan dari dropdown
        const reasonText = dispensation.customReason && dispensation.customReason.trim() !== '' 
            ? `${dispensation.reason}: ${dispensation.customReason}` 
            : dispensation.reason;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dispensation.name}</td>
            <td>${dispensation.class}</td>
            <td>${reasonText}</td>
            <td>${dispensation.duration} ${dispensation.timeUnit}</td>
            <td>${formattedTime}</td>
            <td>
                <button class="btn-done" data-id="${dispensation.id}">
                    <i class="fas fa-check"></i> Selesai
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Tambahkan event listener untuk tombol selesai
    document.querySelectorAll('.btn-done').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            markAsDone(id);
        });
    });
}

// Tandai dispensasi sebagai selesai
function markAsDone(id) {
    // Konfirmasi sebelum menghapus
    if (confirm('Apakah Anda yakin siswa ini sudah kembali ke kelas?')) {
        dispensations = dispensations.filter(d => d.id !== id);
        saveToLocalStorage();
        renderTable();
        toggleEmptyState();
        updateStats();
    }
}

// Simpan ke localStorage
function saveToLocalStorage() {
    localStorage.setItem('dispensations', JSON.stringify(dispensations));
}

// Generate ID unik
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tampilkan notifikasi
function showNotification(message) {
    notificationMessage.textContent = message;
    notificationModal.classList.add('show');
    
    // Auto close setelah 5 detik
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notificationModal.classList.remove('show');
    }, 5000);
}

// Tutup modal notifikasi
function closeNotification() {
    notificationModal.classList.remove('show');
}

// Event listener untuk form
dispensationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validasi input
    if (!studentNameInput.value.trim()) {
        alert('Nama siswa harus diisi');
        studentNameInput.focus();
        return;
    }
    
    if (!studentClassSelect.value) {
        alert('Kelas harus dipilih');
        studentClassSelect.focus();
        return;
    }
    
    if (!reasonSelect.value) {
        alert('Alasan dispensasi harus dipilih');
        reasonSelect.focus();
        return;
    }
    
    // Buat objek dispensasi baru
    const newDispensation = {
        id: generateId(),
        name: studentNameInput.value.trim(),
        class: studentClassSelect.value,
        reason: reasonSelect.value,
        customReason: customReasonTextarea.value.trim(),
        duration: parseInt(durationInput.value),
        timeUnit: timeUnitSelect.value,
        timestamp: new Date().toISOString()
    };
    
    // Tambahkan ke array
    dispensations.unshift(newDispensation);
    
    // Simpan ke localStorage
    saveToLocalStorage();
    
    // Update UI
    renderTable();
    toggleEmptyState();
    updateStats();
    
    // Tampilkan notifikasi
    const notificationText = `Dispensasi berhasil diajukan untuk ${newDispensation.name} (${newDispensation.class}) dengan alasan ${newDispensation.reason} selama ${newDispensation.duration} ${newDispensation.timeUnit}.`;
    showNotification(notificationText);
    
    // Reset form
    dispensationForm.reset();
    durationInput.value = 1;
    timeUnitSelect.value = 'jam';
});

// Event listener untuk modal
closeModalButton.addEventListener('click', closeNotification);
confirmModalButton.addEventListener('click', closeNotification);

// Tutup modal saat klik di luar konten modal
notificationModal.addEventListener('click', function(e) {
    if (e.target === notificationModal) {
        closeNotification();
    }
});

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    toggleEmptyState();
    updateStats();
    
    // Tambahkan contoh data untuk demonstrasi
    if (dispensations.length === 0) {
        const exampleDispensations = [
            {
                id: generateId(),
                name: "Ahmad Fauzi",
                class: "XII IPA 1",
                reason: "Kegiatan Sekolah",
                customReason: "Mengikuti lomba OSN bidang Matematika di tingkat provinsi",
                duration: 2,
                timeUnit: "hari",
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 jam yang lalu
            },
            {
                id: generateId(),
                name: "Siti Nurhaliza",
                class: "XI IPS 2",
                reason: "Kesehatan",
                customReason: "Kontrol rutin ke dokter spesialis",
                duration: 3,
                timeUnit: "jam",
                timestamp: new Date(Date.now() - 7200000).toISOString() // 2 jam yang lalu
            }
        ];
        
        dispensations = exampleDispensations;
        saveToLocalStorage();
        renderTable();
        toggleEmptyState();
        updateStats();
    }
});

// Tambahkan efek visual untuk form
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Tambahkan sedikit CSS untuk efek fokus
const style = document.createElement('style');
style.textContent = `
    .form-group.focused label {
        color: var(--primary-color);
        font-weight: 600;
    }
`;
document.head.appendChild(style);