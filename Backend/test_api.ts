async function main() {
    const response = await fetch('http://localhost:3001/api/projects/onboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: "Test Project",
            description: "Testing smart contract integration",
            category: "Tech",
            organizationId: "org-1",
            researcherId: "res-1",
            totalFunding: 10000000, // 10 ADA
            milestones: [
                {
                    title: "M1",
                    description: "D1",
                    deliverables: "Code",
                    fundingPercentage: 50,
                    deadline: "2024-12-31"
                },
                {
                    title: "M2",
                    description: "D2",
                    deliverables: "Report",
                    fundingPercentage: 50,
                    deadline: "2025-03-31"
                }
            ]
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
