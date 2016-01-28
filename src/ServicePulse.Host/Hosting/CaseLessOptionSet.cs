namespace ServicePulse.Host.Hosting
{
    using System;

    /// <summary>
    /// Extend the NDESK Optionset to be case insensitive
    /// </summary>
    public class CaseLessOptionSet : OptionSet
    {
        protected override void InsertItem(int index, Option item)
        {
            if (item.Prototype.ToLower() != item.Prototype)
                throw new ArgumentException("prototypes must be lower-case!");
            base.InsertItem(index, item);
        }

        protected override OptionContext CreateOptionContext()
        {
            return new OptionContext(this);
        }

        protected override bool Parse(string option, OptionContext c)
        {
            string flag, name, sep, value;
            var haveParts = GetOptionParts(option, out flag, out name, out sep, out value);
            var newOption = option;

            if (haveParts)
            {
                newOption = flag + name.ToLower() + (value != null ? sep + value : "");
            }
            return base.Parse(newOption, c);
        }

    }
}