using NUnit.Framework;
using Particular.Approvals;
using System.IO;

class APIApprovals
{
    [Test]
    public void PlatformSampleApprovals()
    {
        //HINT: If this test fails the Particular.PlatformSample project's app.constants.js probably needs to be updated
        Approver.Verify(File.ReadAllText(Path.Combine(TestContext.CurrentContext.TestDirectory, "app.constants.js")));
    }
}